import { SignupForm } from "@/components/signup-form";
import { Card, CardContent } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth-layout";
import Link from "next/link";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details to create your account"
    >
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <SignupForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
