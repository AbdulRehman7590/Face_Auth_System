"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordLoginForm } from "./password-login-form";
import { FaceCaptureComponent } from "./face-capture-component";
import { Button } from "@/components/ui/button";
import { ResetPasswordFlow } from "@/components/reset-password-flow";
import { motion, AnimatePresence } from "framer-motion";

export function FaceLoginForm() {
  const router = useRouter();
  const [matchedEmail, setMatchedEmail] = useState<string | null>(null);
  const [faceVerified, setFaceVerified] = useState(false);
  const [showResetFlow, setShowResetFlow] = useState(false);

  const handleFaceSuccess = (email?: string) => {
    if (email) {
      setMatchedEmail(email);
      setFaceVerified(true);
    } else {
      router.push("/signup");
    }
  };

  const handleResetPassword = () => {
    if (matchedEmail) {
      setShowResetFlow(true);
    }
  };

  const handleBackToLogin = () => {
    setShowResetFlow(false);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!faceVerified ? (
          <motion.div
            key="face-capture"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <FaceCaptureComponent mode="login" onSuccess={handleFaceSuccess} />
          </motion.div>
        ) : showResetFlow ? (
          <motion.div
            key="reset-flow"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <ResetPasswordFlow
              email={matchedEmail || ""}
              onBack={handleBackToLogin}
            />
          </motion.div>
        ) : (
          <motion.div
            key="password-login"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </motion.div>
              <h3 className="text-lg font-medium text-green-600">
                Face recognized!
              </h3>
              <p className="text-sm text-muted-foreground">
                Welcome back! Please enter your password to continue.
              </p>
            </div>

            <PasswordLoginForm email={matchedEmail || ""} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full auth-button"
              onClick={handleResetPassword}
            >
              Reset Password
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
