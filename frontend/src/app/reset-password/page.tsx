import { ResetPasswordForm } from "@/components/reset-password-form";
import { CardContent } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth-layout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      description="Enter your new password below"
    >
      <CardContent className="p-6">
        <ResetPasswordForm />
      </CardContent>
    </AuthLayout>
  );
}
