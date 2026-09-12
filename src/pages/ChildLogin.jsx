import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Delete, Loader2 } from "lucide-react";
import Lotfy from "@/components/fin/Lotfy";
import { FadeIn } from "@/components/fin/ui";
import { useAuth } from "@/lib/AuthContext";

const PIN_LENGTH = 4;

function PinDots({ length, filled }) {
  return (
    <div className="flex justify-center gap-4 my-6">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={
            "w-4 h-4 rounded-full transition-all " +
            (i < filled ? "bg-white scale-110" : "bg-white/25")
          }
        />
      ))}
    </div>
  );
}

function Keypad({ onDigit, onBackspace, disabled }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {keys.map((k, i) => {
        if (k === "") return <div key={i} />;
        if (k === "back") {
          return (
            <button
              key={i}
              onClick={onBackspace}
              disabled={disabled}
              className="h-16 rounded-2xl bg-white/15 flex items-center justify-center active:scale-95 active:bg-white/25 transition-all disabled:opacity-40"
            >
              <Delete className="w-6 h-6 text-white" />
            </button>
          );
        }
        return (
          <button
            key={i}
            onClick={() => onDigit(k)}
            disabled={disabled}
            className="h-16 rounded-2xl bg-white/15 text-white text-2xl font-extrabold font-heading active:scale-95 active:bg-white/25 transition-all disabled:opacity-40"
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}

export default function ChildLogin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { lookupFamilyChildren, loginChild } = useAuth();

  const [step, setStep] = useState("code"); // "code" | "children" | "pin"
  const [familyCode, setFamilyCode] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFindFamily = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await lookupFamilyChildren(familyCode.toUpperCase());
      setFamilyName(res.family_name);
      setChildren(res.children || []);
      setStep("children");
    } catch (err) {
      setError(err.message || t('auth.child.family_not_found'));
    } finally {
      setLoading(false);
    }
  };

  const handlePickChild = (child) => {
    setSelectedChild(child);
    setPin("");
    setError("");
    setStep("pin");
  };

  const submitPin = async (fullPin) => {
    setError("");
    setLoading(true);
    try {
      await loginChild(familyCode.toUpperCase(), selectedChild.id, fullPin);
      navigate("/child");
    } catch (err) {
      setError(err.message || t('auth.child.wrong_pin'));
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleDigit = (digit) => {
    if (loading || pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      submitPin(next);
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    setPin((p) => p.slice(0, -1));
  };

  return (
    <div
      className="min-h-screen flex flex-col px-6 py-10 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#00B894,#0F2D52)" }}
    >
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
      <div className="absolute -left-14 bottom-10 w-40 h-40 rounded-full bg-white/10" />

      {step !== "code" && (
        <button
          onClick={() => {
            setError("");
            if (step === "pin") setStep("children");
            else setStep("code");
          }}
          className="relative z-10 flex items-center gap-1 text-sm text-white/80 mb-2 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> {t('auth.child.back')}
        </button>
      )}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {step === "code" && (
          <FadeIn className="w-full max-w-sm text-center">
            <Lotfy size={88} />
            <h1 className="text-2xl font-extrabold font-heading mt-4">{t('auth.child.hey_explorer')}</h1>
            <p className="text-sm text-white/75 mt-1 mb-8">
              {t('auth.child.ask_parent')}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-white/15 text-white text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleFindFamily} className="space-y-4">
              <input
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoFocus
                maxLength={6}
                placeholder={t('auth.child.family_code')}
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                className="w-full h-16 rounded-2xl bg-white/15 text-center text-2xl font-extrabold font-heading tracking-[0.3em] text-white placeholder:text-white/40 placeholder:tracking-normal placeholder:text-sm outline-none focus:bg-white/20 transition-all"
                required
              />
              <button
                type="submit"
                disabled={loading || familyCode.length < 6}
                className="w-full h-14 rounded-2xl bg-white text-sm font-extrabold font-heading flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ color: "#0F2D52" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {t('auth.child.searching')}
                  </>
                ) : (
                  t('auth.child.find_family')
                )}
              </button>
            </form>

            <p className="text-xs text-white/60 mt-8">
              {t('auth.child.are_you_parent')}{" "}
              <Link to="/login" className="font-semibold underline">
                {t('auth.child.login_here')}
              </Link>
            </p>
          </FadeIn>
        )}

        {step === "children" && (
          <FadeIn className="w-full max-w-sm text-center">
            <h1 className="text-xl font-extrabold font-heading">
              {t('auth.child.welcome_family', { family: familyName })}
            </h1>
            <p className="text-sm text-white/75 mt-1 mb-6">{t('auth.child.which_one')}</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-white/15 text-white text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handlePickChild(c)}
                  className="glass rounded-2xl p-4 flex flex-col items-center gap-2 shadow-premium active:scale-95 transition-all bg-white/10"
                >
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    🦁
                  </div>
                  <div className="font-bold text-sm text-white">{c.full_name}</div>
                </button>
              ))}
            </div>

            {children.length === 0 && (
              <p className="text-sm text-white/70 mt-4">
                {t('auth.child.no_kids')}
              </p>
            )}
          </FadeIn>
        )}

        {step === "pin" && selectedChild && (
          <FadeIn className="w-full max-w-sm text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center text-3xl mb-3">
              🦁
            </div>
            <h1 className="text-xl font-extrabold font-heading">
              {t('auth.child.hi_kid', { name: selectedChild.full_name })}
            </h1>
            <p className="text-sm text-white/75 mt-1">{t('auth.child.enter_pin')}</p>

            <PinDots length={PIN_LENGTH} filled={pin.length} />

            {error && (
              <div className="mb-2 p-3 rounded-xl bg-white/15 text-white text-sm">
                {error}
              </div>
            )}

            <Keypad onDigit={handleDigit} onBackspace={handleBackspace} disabled={loading} />

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-white/80 mt-4">
                <Loader2 className="w-4 h-4 animate-spin" /> {t('auth.child.checking')}
              </div>
            )}
          </FadeIn>
        )}
      </div>
    </div>
  );
}