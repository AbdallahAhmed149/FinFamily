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
import { useAuth } from "@/lib/AuthContext";

const registry = {
  gm1: BudgetBuilder, gm2: BudgetBuilder, gm3: NeedsVsWants, gm4: GuessPrice,
  gm5: CoinCatcher, gm6: NeedsVsWants, gm7: ChangeMaker,
  gm8: SmartShopper, gm9: ScamDetective, gm10: FutureInvestor, gm11: SavingHero,
};

export default function GameLauncher({ game, onClose }) {
  const [reward, setReward] = useState(null);
  const [error, setError] = useState(null);
  const { refreshUser } = useAuth();
  const G = registry[game.id] || SmartShopper;

  // المكافأة بتتحدد في الباك اند بس (GAME_CATALOG) — احنا هنا بس بنبعت النتيجة
  // الخام (score/total) اللي اللعبة وصلتلها، وبنعرض اللي السيرفر يرجعه فعليًا.
  const handleFinish = async (score, total) => {
    setError(null);
    try {
      const res = await completeGame(game.id, score, total);
      setReward({
        score, total,
        coins: res.coins_awarded, xp: res.xp_awarded,
        alreadyToday: res.already_rewarded_today, leveledUp: res.leveled_up,
        newBadges: res.newly_unlocked_badges || [],
        perfectDayCoins: res.perfect_day_bonus_coins, perfectDayXp: res.perfect_day_bonus_xp,
      });
      // الرصيد (coins) بيتحدث لوحده لأن Home/Profile بيجيبوا الـ wallet تاني كل ما تفتحهم،
      // لكن الـ xp/level/streak جايين من AuthContext.user اللي بيتحمّل مرة واحدة بس وقت
      // الدخول ومبيتحدثش لوحده — من غير الاستدعاء ده هيفضلوا قيمهم القديمة لحد ما الطفل
      // يعمل logout/login تاني، حتى لو الشاشة قدامه بتوري رقم XP جديد صح.
      refreshUser().catch(() => {}); // ميوقفش شاشة المكافأة لو الريفريش فشل لأي سبب
    } catch (err) {
      setError(err.message || "تعذر تسجيل نتيجة اللعبة");
      // برضو نوري شاشة إنهاء (من غير مكافأة) عشان الطفل ميفضلش واقف
      setReward({ score, total, coins: 0, xp: 0, alreadyToday: false, leveledUp: false, newBadges: [], perfectDayCoins: 0, perfectDayXp: 0 });
    }
  };

  const abort = () => onClose(false);
  const complete = () => { setReward(null); onClose(true); };

  const noteLines = [];
  if (reward?.alreadyToday) noteLines.push("You already earned coins for this game today — nice practice run though! 💪");
  if (reward?.perfectDayCoins > 0) noteLines.push(`🌟 Perfect Day bonus: +${reward.perfectDayCoins} coins, +${reward.perfectDayXp} XP — you played every game today!`);
  if (reward?.newBadges?.length) noteLines.push(`New badge${reward.newBadges.length > 1 ? "s" : ""}: ${reward.newBadges.map((b) => `${b.icon} ${b.name}`).join(", ")}`);
  if (!reward?.alreadyToday && error) noteLines.push(error);

  return (
    <GameOverlay title={game.title} icon={game.icon} onClose={abort}>
      {reward ? (
        <RewardScreen
          title={reward.newBadges?.length ? "New Badge Unlocked! 🏅" : reward.leveledUp ? "Level Up! 🎉" : "Mission Complete!"}
          score={reward.score}
          total={reward.total}
          coins={reward.coins + (reward.perfectDayCoins || 0)}
          xp={reward.xp + (reward.perfectDayXp || 0)}
          note={noteLines.length ? noteLines.join(" · ") : undefined}
          onClose={complete}
        />
      ) : (
        <G onFinish={handleFinish} />
      )}
    </GameOverlay>
  );
}