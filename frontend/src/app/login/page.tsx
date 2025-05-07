import { FaceLoginForm } from "@/components/face-login-form";
import { CardContent } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth-layout";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Login with facial recognition to access your account"
    >
      <CardContent className="p-6">
        <FaceLoginForm />

        <div className="mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </AuthLayout>
  );
}
