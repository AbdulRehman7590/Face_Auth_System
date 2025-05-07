"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, KeyRound, ShieldCheck, Loader2 } from "lucide-react";
import api from "@/utils/api";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface ResetPasswordFlowProps {
  email: string;
  onBack: () => void;
}

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits" }),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function ResetPasswordFlow({ email, onBack }: ResetPasswordFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<"sending" | "otp" | "password">("sending");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const sendOTP = useCallback(async () => {
    setIsLoading(true);
    setStep("sending");

    try {
      await api.post("/users/otp/send", { email });

      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${email}`,
      });

      setStep("otp");
      setTimeLeft(60);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      });
      onBack();
    } finally {
      setIsLoading(false);
    }
  }, [email, onBack]);

  useEffect(() => {
    sendOTP();
  }, [sendOTP]);

  useEffect(() => {
    if (step !== "otp" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  async function verifyOTP(values: z.infer<typeof otpSchema>) {
    setIsLoading(true);

    try {
      await api.post("/users/otp/verify", {
        email,
        otp: values.otp,
      });

      toast({
        title: "OTP Verified",
        description: "Verification successful",
      });

      setStep("password");
    } catch (error) {
      console.error("OTP verification error:", error);
      otpForm.setError("otp", {
        type: "manual",
        message: "Invalid verification code",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function resetPassword(values: z.infer<typeof passwordSchema>) {
    setIsLoading(true);

    try {
      await api.post("/password/reset", {
        email,
        password: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      toast({
        title: "Password Reset",
        description: "Your password has been reset successfully",
      });

      router.push("/login");
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">Reset Password</h3>
      </div>

      {step === "sending" && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Sending verification code to {email}...
          </p>
        </div>
      )}

      {step === "otp" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="rounded-full bg-blue-100 p-3">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-center text-sm">
              We&apos;ve sent a verification code to{" "}
              <span className="font-medium">{email}</span>
            </p>
          </div>

          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(verifyOTP)}
              className="space-y-4"
            >
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="text-center text-lg tracking-widest"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            {timeLeft > 0 ? (
              <p className="text-muted-foreground">
                Resend code in {timeLeft} seconds
              </p>
            ) : (
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={sendOTP}
                disabled={isLoading}
              >
                Resend verification code
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {step === "password" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="rounded-full bg-green-100 p-3">
              <KeyRound className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-center text-sm">
              Create a new password for your account
            </p>
          </div>

          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(resetPassword)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        </motion.div>
      )}
    </div>
  );
}
