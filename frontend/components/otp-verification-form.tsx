"use client";

import { useState, useEffect } from "react";
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api from "@/utils/api";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const formSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits" }),
});

export function OtpVerificationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const email = sessionStorage.getItem("userEmail");
    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please go back to signup.",
        variant: "destructive",
      });
      router.push("/signup");
      return;
    }

    try {
      // Verify OTP
      await api.post("/users/otp/verify", {
        email,
        otp: values.otp,
      });

      toast({
        title: "Success",
        description: "OTP verified successfully",
      });

      // Redirect to face capture page
      router.push("/face-capture");
    } catch (error) {
      console.error("OTP verification error:", error);
      form.setError("otp", {
        type: "manual",
        message: "Invalid OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendOtp = async () => {
    const email = sessionStorage.getItem("userEmail");
    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please go back to signup.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/users/otp/send", { email });
      setTimeLeft(60);
      toast({
        title: "Success",
        description: "A new verification code has been sent to your email",
      });
    } catch (error) {
      console.log("Resend OTP error:", error);
      toast({
        title: "Error",
        description: "Failed to resend code",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-4 space-y-2"
        >
          <div className="rounded-full bg-blue-100 p-3">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-center text-sm">
            Enter the 6-digit code sent to your email
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="123456"
                    maxLength={6}
                    inputMode="text"
                    type="text"
                    className="otp-input text-center text-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Button
            type="submit"
            className="w-full auth-button"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm"
        >
          {timeLeft > 0 ? (
            <p className="text-muted-foreground">
              Resend code in <span className="font-medium">{timeLeft}</span>{" "}
              seconds
            </p>
          ) : (
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={handleResendOtp}
            >
              Resend verification code
            </Button>
          )}
        </motion.div>
      </form>
    </Form>
  );
}
