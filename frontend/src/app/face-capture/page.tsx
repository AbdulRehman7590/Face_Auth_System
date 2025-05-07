"use client";

import { FaceCaptureComponent } from "@/components/face-capture-component";
import { CardContent } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth-layout";

export default function FaceCapturePage() {
  return (
    <AuthLayout
      title="Register Your Face"
      description="We'll use this for secure login in the future"
    >
      <CardContent className="p-6">
        <FaceCaptureComponent
          mode="register"
          onSuccess={() => (window.location.href = "/dashboard")}
        />
      </CardContent>
    </AuthLayout>
  );
}
