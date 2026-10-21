import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { FadeIn, SectionTitle } from "@/components/fin/ui";
import AvatarFrame from "@/components/fin/AvatarFrame";
import { LOTFY_MOODS } from "@/components/fin/Lotfy";
import { getShop, buyShopItem, equipShopItem, unequipShopItem } from "@/lib/finApi";
import { useAuth } from "@/lib/AuthContext";
import { FRAMES, KIND_ORDER, PREMIUM_CARD_THEMES, cosmeticMeta, nameOf } from "@/lib/cosmetics";
import { play } from "@/lib/sounds";
import { burst } from "@/lib/celebrate";

const LOAD_FAILED = "__load_failed__";

function Preview({ id, kind, meta }) {
  if (kind === "frame") {
    return (
      <AvatarFrame frame={id}>
        <div className="w-14 h-14 rounded-full overflow-hidden bg-emerald-500/30">
          <img src={LOTFY_MOODS.happy} alt="" className="w-full h-full object-cover object-top" draggable={false} />
        </div>
      </AvatarFrame>
    );
  }
  if (kind === "title") {
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-600 text-xs font-bold px-3 py-1.5">{meta.emoji}</span>;
  }
  const th = PREMIUM_CARD_THEMES.find((x) => x.id === id);
  return <div className="w-full h-14 rounded-xl shadow-premium flex items-center justify-center text-xl" style={{ background: th?.gradient }}>💳</div>;
}

export default function GemShop() {
  const { t, i18n } = useTranslation();
  const { refreshUser } = useAuth();
  const [shop, setShop] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  // مفيش dependency على t هنا: لو الـ effect اتعلّق بدالة بتتغيّر كل render ممكن يعمل fetch لا نهائي.
  // الرسالة الافتراضية بتتترجم وقت العرض (LOAD_FAILED).
  const load = useCallback(async () => {
    try {
      setShop(await getShop());
      setError(null);
    } catch (err) {
      setError(err.message || LOAD_FAILED);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (id, fn, after) => {
    if (busy) return;
    setBusy(id);
    setError(null);
    try {
      await fn();
      after?.();
      await load();
      refreshUser?.().catch?.(() => {}); // الجواهر الجديدة في باقي التطبيق
    } catch (err) {
      setError(err.message || t("shop.actionFailed"));
      play("wrong");
      await load();
    } finally {
      setBusy(null);
    }
  };

  // الشراء بيفعّل العنصر على طول (الطفل عايز يشوفه فورًا)
  const buy = (item) => run(item.id, async () => {
    await buyShopItem(item.id);
    await equipShopItem(item.id);
  }, () => { play("questDone"); burst(); });
  const equip = (item) => run(item.id, () => equipShopItem(item.id), () => play("tap"));
  const remove = (item) => run(item.id, () => unequipShopItem(item.kind), () => play("back"));

  if (!shop) {
    return error
      ? <div role="alert" className="rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error === LOAD_FAILED ? t("shop.loadFailed") : error}</div>
      : <div className="glass rounded-3xl h-40 animate-pulse" aria-busy="true" />;
  }

  const gems = shop.gems;
  const known = shop.items.filter((i) => cosmeticMeta(i.id));

  return (
    <div data-testid="gem-shop">
      <FadeIn delay={40}>
        <div className="rounded-3xl p-5 text-center text-white shadow-premium relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0ea5e9,#7c3aed)" }}>
          <div className="absolute -end-4 -top-4 text-6xl opacity-20">💎</div>
          <div className="text-sm text-white/80 font-medium">{t("shop.yourGems")}</div>
          <div className="text-4xl font-extrabold font-heading mt-1" data-testid="gem-balance">💎 {gems}</div>
          <div className="text-xs text-white/80 mt-1">{t("shop.earnHint")}</div>
        </div>
      </FadeIn>

      {error && <div role="alert" className="mt-3 rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3">{error === LOAD_FAILED ? t("shop.loadFailed") : error}</div>}

      {KIND_ORDER.map((kind) => {
        const items = known.filter((i) => i.kind === kind);
        if (!items.length) return null;
        return (
          <FadeIn key={kind} delay={100} className="mt-5">
            <SectionTitle>{t(`shop.sections.${kind}`)}</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => {
                const meta = cosmeticMeta(item.id);
                const afford = gems >= item.price;
                return (
                  <div key={item.id} data-testid={`shop-item-${item.id}`} className={"glass rounded-2xl p-3 text-center shadow-premium flex flex-col items-center " + (item.equipped ? "ring-2 ring-emerald-500" : "")}>
                    <div className="h-16 w-full flex items-center justify-center mb-2"><Preview id={item.id} kind={kind} meta={meta} /></div>
                    <div className="font-bold text-sm leading-tight">{kind === "title" ? `${meta.emoji} ` : ""}{nameOf(meta.name, i18n.language)}</div>
                    <div className="mt-2 w-full">
                      {!item.owned ? (
                        <button
                          onClick={() => buy(item)}
                          disabled={!afford || busy !== null}
                          className={"w-full h-9 rounded-xl text-sm font-bold transition-all " + (afford ? "grad-navy text-white active:scale-95" : "bg-black/5 text-muted-foreground")}
                        >
                          {afford ? `${item.price} 💎` : t("shop.needMore", { count: item.price - gems })}
                        </button>
                      ) : item.equipped ? (
                        <div className="space-y-1">
                          <div className="w-full h-9 rounded-xl bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-1"><Check className="w-4 h-4" /> {t("shop.inUse")}</div>
                          {kind !== "card_theme" && (
                            <button onClick={() => remove(item)} disabled={busy !== null} className="text-[11px] text-muted-foreground underline">{t("shop.remove")}</button>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => equip(item)} disabled={busy !== null} className="w-full h-9 rounded-xl bg-amber-400/20 text-amber-700 text-sm font-bold active:scale-95 transition-all">{t("shop.use")}</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}