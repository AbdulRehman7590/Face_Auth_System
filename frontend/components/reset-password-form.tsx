"use client";

import { useState } from "react";
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
import api from "@/utils/api";
import { toast } from "@/components/ui/use-toast";

const formSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    otp: z.string().length(6, { message: "OTP must be 6 digits" }).optional(),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export function ResetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      if (step === "email") {
        // Request password reset
        await api.post("/password/request", { email: values.email });

        toast({
          title: "Success",
          description: "Reset link sent to your email",
        });

        // Redirect to forgot password page
        router.push("/forgot-password");
      } else if (step === "otp") {
        // Verify OTP
        await api.post("/users/otp/verify", {
          email: values.email,
          otp: values.otp || "",
        });

        setStep("password");
      } else if (step === "password") {
        // Reset password (you'll need to implement this endpoint)
        await api.post("/password/reset", {
          email: values.email,
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
        });

        toast({
          title: "Success",
          description: "Password reset successfully",
        });

        // Redirect to login
        router.push("/login");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive",
      });

      if (step === "otp") {
        form.setError("otp", {
          type: "manual",
          message: "Invalid OTP. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {step === "email" && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {step === "otp" && (
          <FormField
            control={form.control}
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {step === "password" && (
          <>
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? "Processing..."
            : step === "email"
            ? "Send Reset Code"
            : step === "otp"
            ? "Verify Code"
            : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
}
