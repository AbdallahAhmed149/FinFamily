import React, { useState } from "react";
import GameOverlay from "@/components/fin/GameOverlay";
import RewardScreen from "@/components/fin/RewardScreen";
import BudgetBuilder from "@/components/fin/games/BudgetBuilder";
import NeedsVsWants from "@/components/fin/games/NeedsVsWants";
import GuessPrice from "@/components/fin/games/GuessPrice";
import CoinCatcher from "@/components/fin/games/CoinCatcher";
import ChangeMaker from "@/components/fin/games/ChangeMaker";
import SmartShopper from "@/components/fin/games/SmartShopper";
import ScamDetective from "@/components/fin/games/ScamDetective";
import FutureInvestor from "@/components/fin/games/FutureInvestor";
import SavingHero from "@/components/fin/games/SavingHero";
import { completeGame } from "@/lib/finApi";
import { useTranslation } from "react-i18next";

const registry = {
  gm1: BudgetBuilder, gm2: BudgetBuilder, gm3: NeedsVsWants, gm4: GuessPrice,
  gm5: CoinCatcher, gm6: NeedsVsWants, gm7: ChangeMaker,
  gm8: SmartShopper, gm9: ScamDetective, gm10: FutureInvestor, gm11: SavingHero,
};

export default function GameLauncher({ game, onClose }) {
  const { t } = useTranslation();
  const [reward, setReward] = useState(null);
  const [error, setError] = useState(null);
  const G = registry[game.id] || SmartShopper;

  // المكافأة بتتحدد في الباك اند بس (GAME_CATALOG) — احنا هنا بس بنبعت النتيجة
  // الخام (score/total) اللي اللعبة وصلتلها، وبنعرض اللي السيرفر يرجعه فعليًا.
  const handleFinish = async (score, total) => {
    setError(null);
    try {
      const res = await completeGame(game.id, score, total);
      setReward({ score, total, coins: res.coins_awarded, xp: res.xp_awarded, alreadyToday: res.already_rewarded_today, leveledUp: res.leveled_up });
    } catch (err) {
      setError(err.message || "تعذر تسجيل نتيجة اللعبة");
      // برضو نوري شاشة إنهاء (من غير مكافأة) عشان الطفل ميفضلش واقف
      setReward({ score, total, coins: 0, xp: 0, alreadyToday: false, leveledUp: false });
    }
  };

  const abort = () => onClose(false);
  const complete = () => { setReward(null); onClose(true); };

  return (
    <GameOverlay title={game.title} icon={game.icon} onClose={abort}>
      {reward ? (
        <RewardScreen
          title={reward.leveledUp ? "مستوى جديد! 🎉" : t("shared.mission_complete.title")}
          score={reward.score}
          total={reward.total}
          coins={reward.coins}
          xp={reward.xp}
          note={reward.alreadyToday ? "لقد كسبت عملات لهذه اللعبة اليوم بالفعل — لكن تمرين رائع! 💪" : error || undefined}
          onClose={complete}
        />
      ) : (
        <G onFinish={handleFinish} />
      )}
    </GameOverlay>
  );
}