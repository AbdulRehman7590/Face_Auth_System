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
import Link from "next/link";
import api from "@/utils/api";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  password: z.string().min(1, { message: "Password is required" }),
});

export function PasswordLoginForm({ email }: { email: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showResetOption, setShowResetOption] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Login with password
      const res = await api.post("/users/login-password", {
        email,
        password: values.password,
      });

      // Store auth token
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);

      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      form.setError("password", {
        type: "manual",
        message: "Incorrect password",
      });
      setShowResetOption(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>

        {showResetOption && (
          <div className="text-center">
            <Link
              href="/reset-password"
              className="text-sm text-primary underline"
            >
              Forgot password? Reset it here
            </Link>
          </div>
        )}
      </form>
    </Form>
  );
}
