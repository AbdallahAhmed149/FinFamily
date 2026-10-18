import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ShieldCheck, ShieldOff, Loader2, KeyRound, Copy, Check, RefreshCw } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle } from "@/components/fin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMfaStatus, setupMfa, enableMfa, disableMfa, getRecoveryCodesStatus, regenerateRecoveryCodes } from "@/lib/finApi";
import { useAuth } from "@/lib/AuthContext";

export default function Security() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const mfaRequired = user && user.mfa_enabled === false; // إجباري — لسه معملهاش، فمفيش رجوع لحد ما يخلص

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");

  // مرحلة الإعداد (بعد ما نطلب /mfa/setup ولحد ما يتأكد)
  const [setupData, setSetupData] = useState(null); // { secret, otpauth_url, qr_code_data_uri }
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  // مرحلة الإلغاء
  const [showDisable, setShowDisable] = useState(false);
  const [password, setPassword] = useState("");

  // أكواد الاسترجاع — بتتعرض مرة واحدة بس (وقت التفعيل، أو بعد إعادة التوليد)
  const [freshCodes, setFreshCodes] = useState(null);
  const [copied, setCopied] = useState(false);
  const [codesStatus, setCodesStatus] = useState(null); // { total, remaining }
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [regenPassword, setRegenPassword] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMfaStatus()
      .then((res) => {
        if (cancelled) return;
        setEnabled(res.enabled);
        if (res.enabled) {
          getRecoveryCodesStatus().then((s) => !cancelled && setCodesStatus(s)).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingStatus(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startSetup = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await setupMfa();
      setSetupData(res);
    } catch (err) {
      setError(err.message || t("parent.security.setupFailed"));
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await enableMfa(code);
      setEnabled(true);
      setSetupData(null);
      setCode("");
      setFreshCodes(res.codes); // لازم الأب يشوفهم ويحفظهم قبل ما يكمل — مش هيتعرضوا تاني
      setCodesStatus({ total: res.codes.length, remaining: res.codes.length });
      await refreshUser(); // يحدّث user.mfa_enabled في الـ context عشان الـ Route Guard يفتح الطريق
    } catch (err) {
      setError(err.message || t("parent.security.invalidCode"));
    } finally {
      setBusy(false);
    }
  };

  const finishViewingCodes = () => {
    setFreshCodes(null);
    setCopied(false);
    if (mfaRequired) navigate("/parent"); // كان إجباري وخلص — يكمل على طول للداشبورد
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(freshCodes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API ممكن ترفض — مش حاجة نوقف عليها، الأكواد لسه ظاهرة يقدر ينسخها يدوي
    }
  };

  const confirmRegenerate = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await regenerateRecoveryCodes(regenPassword);
      setFreshCodes(res.codes);
      setCodesStatus({ total: res.codes.length, remaining: res.codes.length });
      setShowRegenerate(false);
      setRegenPassword("");
    } catch (err) {
      setError(err.message || t("parent.security.incorrectPassword"));
    } finally {
      setBusy(false);
    }
  };

  const confirmDisable = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await disableMfa(password);
      setEnabled(false);
      setShowDisable(false);
      setPassword("");
      await refreshUser(); // من هنا الـ Route Guard هيرجعه لنفس الصفحة تلقائي (إجبارية) عشان يعيدها
    } catch (err) {
      setError(err.message || t("parent.security.incorrectPassword"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <FadeIn className="flex items-center gap-3 mb-6 pt-2">
        {!mfaRequired && (
          <button
            onClick={() => navigate("/parent")}
            className="w-10 h-10 rounded-full glass flex items-center justify-center shadow-premium shrink-0"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
        )}
        <h1 className="text-lg font-extrabold font-heading">{t("parent.security.title")}</h1>
      </FadeIn>

      {mfaRequired && (
        <FadeIn delay={20} className="mb-4">
          <div className="rounded-2xl p-4 bg-amber-500/10 text-amber-700 text-sm font-medium">
            {t("parent.security.mfaRequiredNote")}
          </div>
        </FadeIn>
      )}

      <SectionTitle>{t("parent.security.twoFactor")}</SectionTitle>
      <FadeIn delay={40} className="mb-4">
        <GlassCard>
          {loadingStatus ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> {t("parent.security.checkingStatus")}
            </div>
          ) : freshCodes ? (
            // ---------------- أكواد الاسترجاع — بتتعرض مرة واحدة بس ----------------
            <div className="space-y-4">
              <div className="rounded-2xl p-3 bg-amber-500/10 text-amber-700 text-xs font-medium">
                {t("parent.security.recoveryCodes.saveNote")}
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {freshCodes.map((c) => (
                  <div key={c} className="rounded-lg bg-black/5 py-2 text-center font-semibold force-ltr">{c}</div>
                ))}
              </div>
              <Button variant="outline" className="w-full h-11" onClick={copyCodes}>
                {copied ? <><Check className="w-4 h-4 me-2" /> {t("parent.security.recoveryCodes.copied")}</> : <><Copy className="w-4 h-4 me-2" /> {t("parent.security.recoveryCodes.copyAll")}</>}
              </Button>
              <Button className="w-full h-11" onClick={finishViewingCodes}>
                {t("parent.security.recoveryCodes.savedThem")}
              </Button>
            </div>
          ) : setupData ? (
            // ---------------- Enrollment: امسح الـ QR وأكد بالكود ----------------
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("parent.security.enroll.scanNote")}
              </p>
              <div className="flex justify-center">
                <img
                  src={setupData.qr_code_data_uri}
                  alt="MFA QR code"
                  className="w-48 h-48 rounded-xl border border-border"
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {t("parent.security.enroll.cantScan")}{" "}
                <span className="font-mono font-semibold force-ltr">{setupData.secret}</span>
              </div>
              <form onSubmit={confirmEnable} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="enable-code">{t("parent.security.enroll.codeLabel")}</Label>
                  <Input
                    id="enable-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-12 text-center text-lg tracking-[0.4em] font-mono force-ltr"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12" disabled={busy || code.length !== 6}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t("parent.security.enroll.confirmEnable")}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setSetupData(null);
                    setCode("");
                    setError("");
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("parent.security.enroll.cancel")}
                </button>
              </form>
            </div>
          ) : enabled ? (
            // ---------------- مفعّل ----------------
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/15 text-emerald-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">{t("parent.security.on.title")}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("parent.security.on.desc")}
                  </div>
                </div>
              </div>

              {!showDisable ? (
                <Button variant="outline" className="w-full h-11" onClick={() => setShowDisable(true)}>
                  {t("parent.security.on.disable")}
                </Button>
              ) : (
                <form onSubmit={confirmDisable} className="space-y-3 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="disable-password">{t("parent.security.on.confirmPasswordLabel")}</Label>
                    <Input
                      id="disable-password"
                      type="password"
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <Button type="submit" variant="destructive" className="w-full h-11" disabled={busy}>
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t("parent.security.on.disableAction")}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisable(false);
                      setPassword("");
                      setError("");
                    }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("parent.security.on.neverMind")}
                  </button>
                </form>
              )}
            </div>
          ) : (
            // ---------------- مش مفعّل ----------------
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-black/5 text-muted-foreground shrink-0">
                  <ShieldOff className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">{t("parent.security.off.title")}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("parent.security.off.desc")}
                  </div>
                </div>
              </div>
              <Button className="w-full h-11" onClick={startSetup} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <KeyRound className="w-4 h-4 me-2" /> {t("parent.security.off.setup")}
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}
        </GlassCard>
      </FadeIn>

      {enabled && !freshCodes && !setupData && (
        <FadeIn delay={80}>
          <SectionTitle>{t("parent.security.recoverySection.title")}</SectionTitle>
          <GlassCard>
            <p className="text-sm text-muted-foreground mb-3">
              {t("parent.security.recoverySection.desc")}
            </p>
            {codesStatus && (
              <div className="text-sm font-semibold mb-3">
                {t("parent.security.recoverySection.unusedCount", { remaining: codesStatus.remaining, total: codesStatus.total })}
              </div>
            )}
            {!showRegenerate ? (
              <Button variant="outline" className="w-full h-11" onClick={() => setShowRegenerate(true)}>
                <RefreshCw className="w-4 h-4 me-2" /> {t("parent.security.recoverySection.generateNew")}
              </Button>
            ) : (
              <form onSubmit={confirmRegenerate} className="space-y-3">
                <div className="rounded-xl p-3 bg-amber-500/10 text-amber-700 text-xs">
                  {t("parent.security.recoverySection.replaceWarning")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regen-password">{t("parent.security.recoverySection.confirmPasswordLabel")}</Label>
                  <Input
                    id="regen-password"
                    type="password"
                    autoFocus
                    value={regenPassword}
                    onChange={(e) => setRegenPassword(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={busy}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t("parent.security.recoverySection.generateNew")}
                </Button>
                <button
                  type="button"
                  onClick={() => { setShowRegenerate(false); setRegenPassword(""); setError(""); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("parent.security.recoverySection.neverMind")}
                </button>
              </form>
            )}
          </GlassCard>
        </FadeIn>
      )}
    </div>
  );
}