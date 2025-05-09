"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TokenExpiredDialog } from "@/components/token-expired-dialog";
import { motion } from "framer-motion";
import { LogOut, User, Shield, Bell } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showTokenExpired, setShowTokenExpired] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userEmail = localStorage.getItem("userEmail");

    if (!isAuthenticated || !userEmail) {
      router.push("/login");
      return;
    }

    setUser({ email: userEmail });

    // Set up token expiration check (for demo purposes)
    const tokenExpiryCheck = setInterval(() => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        clearInterval(tokenExpiryCheck);
        setShowTokenExpired(true);
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(tokenExpiryCheck);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen dashboard-gradient">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Logo />
          </div>
          <div className="flex flex-1 items-center justify-end">
            <Button variant="ghost" size="icon" className="mr-2">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  Welcome back, {user.email.split("@")[0]}!
                </h2>
                <p className="text-sm text-muted-foreground">
                  You have successfully logged in with facial recognition.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Your account is secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your account is protected with facial recognition and
                    password authentication.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <h3 className="font-semibold">Security Status</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Face ID: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Password: Set</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Email: Verified</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <TokenExpiredDialog
        open={showTokenExpired}
        onOpenChange={setShowTokenExpired}
      />
    </div>
  );
}
