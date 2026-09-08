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

const registry = {
  gm1: BudgetBuilder, gm2: BudgetBuilder, gm3: NeedsVsWants, gm4: GuessPrice,
  gm5: CoinCatcher, gm6: NeedsVsWants, gm7: ChangeMaker,
  gm8: SmartShopper, gm9: ScamDetective, gm10: FutureInvestor, gm11: SavingHero,
};

export default function GameLauncher({ game, onClose }) {
  const [reward, setReward] = useState(null);
  const G = registry[game.id] || SmartShopper;

  const handleFinish = (score, total) => {
    setReward({ score, total, coins: Math.round(score * 6), xp: game.xp || 50 });
  };

  const abort = () => onClose(false);
  const complete = () => { setReward(null); onClose(true); };

  return (
    <GameOverlay title={game.title} icon={game.icon} onClose={abort}>
      {reward ? (
        <RewardScreen title="Mission Complete!" score={reward.score} total={reward.total} coins={reward.coins} xp={reward.xp} onClose={complete} />
      ) : (
        <G onFinish={handleFinish} />
      )}
    </GameOverlay>
  );
}