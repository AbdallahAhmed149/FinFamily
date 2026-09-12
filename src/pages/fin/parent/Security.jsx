import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ShieldCheck, ShieldOff, Loader2, KeyRound } from "lucide-react";
import { GlassCard, FadeIn, SectionTitle } from "@/components/fin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMfaStatus, setupMfa, enableMfa, disableMfa } from "@/lib/finApi";
import { useAuth } from "@/lib/AuthContext";

export default function Security() {
  const navigate = useNavigate();
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

  useEffect(() => {
    let cancelled = false;
    getMfaStatus()
      .then((res) => {
        if (!cancelled) setEnabled(res.enabled);
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
      setError(err.message || "Couldn't start setup");
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await enableMfa(code);
      setEnabled(true);
      setSetupData(null);
      setCode("");
      await refreshUser(); // يحدّث user.mfa_enabled في الـ context عشان الـ Route Guard يفتح الطريق
      if (mfaRequired) navigate("/parent"); // كان إجباري وخلص — يكمل على طول للداشبورد
    } catch (err) {
      setError(err.message || "Invalid code");
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
      setError(err.message || "Incorrect password");
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
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-extrabold font-heading">Security</h1>
      </FadeIn>

      {mfaRequired && (
        <FadeIn delay={20} className="mb-4">
          <div className="rounded-2xl p-4 bg-amber-500/10 text-amber-700 text-sm font-medium">
            To keep your family's account secure, two-factor authentication is required before you can
            continue.
          </div>
        </FadeIn>
      )}

      <SectionTitle>Two-factor authentication</SectionTitle>
      <FadeIn delay={40} className="mb-4">
        <GlassCard>
          {loadingStatus ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking status...
            </div>
          ) : setupData ? (
            // ---------------- Enrollment: امسح الـ QR وأكد بالكود ----------------
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with Google Authenticator or Microsoft Authenticator, then enter the 6-digit
                code it shows to confirm.
              </p>
              <div className="flex justify-center">
                <img
                  src={setupData.qr_code_data_uri}
                  alt="MFA QR code"
                  className="w-48 h-48 rounded-xl border border-border"
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Can't scan it? Enter this code manually:{" "}
                <span className="font-mono font-semibold">{setupData.secret}</span>
              </div>
              <form onSubmit={confirmEnable} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="enable-code">6-digit code</Label>
                  <Input
                    id="enable-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-12 text-center text-lg tracking-[0.4em] font-mono"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12" disabled={busy || code.length !== 6}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & enable"}
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
                  Cancel
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
                  <div className="font-bold">Two-factor authentication is on</div>
                  <div className="text-xs text-muted-foreground">
                    You'll need a code from your authenticator app every time you log in.
                  </div>
                </div>
              </div>

              {!showDisable ? (
                <Button variant="outline" className="w-full h-11" onClick={() => setShowDisable(true)}>
                  Disable
                </Button>
              ) : (
                <form onSubmit={confirmDisable} className="space-y-3 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="disable-password">Confirm your password to disable</Label>
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
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disable two-factor authentication"}
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
                    Never mind
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
                  <div className="font-bold">Two-factor authentication is off</div>
                  <div className="text-xs text-muted-foreground">
                    Add an extra layer of security using an authenticator app.
                  </div>
                </div>
              </div>
              <Button className="w-full h-11" onClick={startSetup} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" /> Set up two-factor authentication
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
    </div>
  );
}