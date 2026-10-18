import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { loginParent } = useAuth();
  const { t } = useTranslation();
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
      setError(err.message || (mfaStep ? t("auth.login.mfa.invalidCode") : t("auth.login.invalidCredentials")));
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
      title={mfaStep ? t("auth.login.mfa.title") : t("auth.login.welcomeBack")}
      subtitle={mfaStep ? t("auth.login.mfa.subtitle") : t("auth.login.subtitle")}
      footer={
        mfaStep ? null : (
          <>
            {t("auth.login.noAccount")}{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              {t("auth.login.createOne")}
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
            <Label htmlFor="email">{t("auth.login.email")}</Label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder={t("auth.login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ps-10 h-12"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("auth.login.password")}</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                {t("auth.login.forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ps-10 h-12"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
                {t("auth.login.loggingIn")}
              </>
            ) : (
              t("auth.login.submit")
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!useRecovery ? (
            <div className="space-y-2">
              <Label htmlFor="otp">{t("auth.login.mfa.codeLabel")}</Label>
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
                className="h-12 text-center text-lg tracking-[0.4em] font-mono force-ltr"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="recovery">{t("auth.login.mfa.recoveryLabel")}</Label>
              <Input
                id="recovery"
                type="text"
                autoComplete="off"
                autoFocus
                placeholder="XXXX-XXXX"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase().slice(0, 9))}
                className="h-12 text-center text-lg tracking-widest font-mono force-ltr"
                required
              />
              <p className="text-xs text-muted-foreground">
                {t("auth.login.mfa.recoveryHint")}
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
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
                {t("auth.login.mfa.verifying")}
              </>
            ) : (
              t("auth.login.mfa.verify")
            )}
          </Button>
          <button
            type="button"
            onClick={() => { setUseRecovery((v) => !v); setOtpCode(""); setRecoveryCode(""); setError(""); }}
            className="w-full text-sm text-primary hover:underline transition-colors"
          >
            {useRecovery ? t("auth.login.mfa.useAuthenticator") : t("auth.login.mfa.useRecovery")}
          </button>
          <button
            type="button"
            onClick={backToPassword}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            {t("common.back")}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}