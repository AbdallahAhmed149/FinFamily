import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { loginParent } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false); // بديل الكود العادي لو فقد جهاز الـ Authenticator
  const [mfaStep, setMfaStep] = useState(false); // لو true يبقى الباسورد صح والمطلوب دلوقتي كود الـ Authenticator بس
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginParent(
        email, password,
        mfaStep && !useRecovery ? otpCode : undefined,
        mfaStep && useRecovery ? recoveryCode : undefined,
      );
      if (result.mfaRequired) {
        setMfaStep(true); // نعرض حقل الكود، من غير ما نعتبر ده خطأ
      } else {
        navigate("/parent");
      }
    } catch (err) {
      setError(err.message || (mfaStep ? "Invalid code" : "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  const backToPassword = () => {
    setMfaStep(false);
    setOtpCode("");
    setRecoveryCode("");
    setUseRecovery(false);
    setError("");
  };

  return (
    <AuthLayout
      icon={mfaStep ? ShieldCheck : LogIn}
      title={mfaStep ? "Two-factor authentication" : "Welcome back"}
      subtitle={mfaStep ? "Enter the 6-digit code from your authenticator app" : "Log in to your account"}
      footer={
        mfaStep ? null : (
          <>
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </>
        )
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {!mfaStep ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!useRecovery ? (
            <div className="space-y-2">
              <Label htmlFor="otp">Authentication code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-12 text-center text-lg tracking-[0.4em] font-mono"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="recovery">Recovery code</Label>
              <Input
                id="recovery"
                type="text"
                autoComplete="off"
                autoFocus
                placeholder="XXXX-XXXX"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase().slice(0, 9))}
                className="h-12 text-center text-lg tracking-widest font-mono"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use one of the one-time recovery codes you saved when you set up two-factor authentication.
              </p>
            </div>
          )}
          <Button
            type="submit"
            className="w-full h-12 font-medium"
            disabled={loading || (useRecovery ? recoveryCode.length < 8 : otpCode.length !== 6)}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
          <button
            type="button"
            onClick={() => { setUseRecovery((v) => !v); setOtpCode(""); setRecoveryCode(""); setError(""); }}
            className="w-full text-sm text-primary hover:underline transition-colors"
          >
            {useRecovery ? "Use authenticator code instead" : "Lost your authenticator? Use a recovery code"}
          </button>
          <button
            type="button"
            onClick={backToPassword}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </form>
      )}
    </AuthLayout>
  );
}