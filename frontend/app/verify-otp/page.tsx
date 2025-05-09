import { OtpVerificationForm } from "@/components/otp-verification-form";
import { Card, CardContent } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth-layout";

export default function VerifyOtpPage() {
  return (
    <AuthLayout
      title="Verify your email"
      description="We've sent a verification code to your email"
    >
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <OtpVerificationForm />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
