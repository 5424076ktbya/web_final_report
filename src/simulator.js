export function runSlumpSimulation(settings, totalSpins = 2500) {
  const hitProb = 1 / Number(settings.hitProb);
  const rushRate = Number(settings.rushRate);
  const continueRate = Number(settings.continueRate);
  const firstBonus = Number(settings.firstBonus) || 0;
  const border = Number(settings.border) || 18;
  const exchangeRate = Number(settings.exchangeRate) || 4;
  
  const ltEntryRate = Number(settings.ltEntryRate) || 0;
  const ltContinueRate = Number(settings.ltContinueRate) || 0;

  const payouts = settings.payouts.map(p => ({
    balls: Number(p.balls) || 0,
    rate: Number(p.rate) || 0
  }));

  const upperPayouts = settings.upperPayouts.map(p => ({
    balls: Number(p.balls) || 0,
    rate: Number(p.rate) || 0
  }));

  const consumptionPerSpin = 250 / border;
  let currentBalls = 0;
  let history = [{ x: 0, y: 0 }];
  
  let maxCombo = 0;
  let jackpotCounts = 0;
  let totalComboCount = 0;
  let totalJackpotBalls = 0;
  let maxJackpotBalls = 0;

  for (let spin = 1; spin <= totalSpins; spin++) {
    currentBalls -= consumptionPerSpin;

    if (Math.random() < hitProb) {
      jackpotCounts++;
      let currentCombo = 1;
      let currentSessionBalls = firstBonus;

      // 【修正ポイント】
      // settings.continueRateが0（LT直行モード）かつ移行率100%の場合は、
      // 最初の当たりから上位モード（isUpperMode = true）で開始する
      let isUpperMode = (continueRate === 0 && ltEntryRate === 100);
      
      currentBalls += firstBonus;
      totalJackpotBalls += firstBonus;

      // RUSH判定（直行タイプの場合はここがLT突入判定になる）
      if (Math.random() * 100 < rushRate) {
        let inRush = true;
        while (inRush && currentCombo < 1000) {
          const currentCont = isUpperMode ? ltContinueRate : continueRate;
          const activePayouts = isUpperMode ? upperPayouts : payouts;
          
          if (Math.random() * 100 < currentCont) {
            currentCombo++;
            const gain = getPayout(activePayouts);
            currentBalls += gain;
            totalJackpotBalls += gain;
            currentSessionBalls += gain;

            // 通常RUSH中にLT移行抽選
            if (!isUpperMode && Math.random() * 100 < ltEntryRate) {
              isUpperMode = true;
            }
          } else {
            inRush = false;
          }
        }
      }
      
      totalComboCount += currentCombo;
      if (currentCombo > maxCombo) maxCombo = currentCombo;
      if (currentSessionBalls > maxJackpotBalls) maxJackpotBalls = currentSessionBalls;
      
      history.push({ x: spin, y: Math.floor(currentBalls * exchangeRate) });
    }
  }
  
  history.push({ x: totalSpins, y: Math.floor(currentBalls * exchangeRate) });

  // 期待値計算のロジック
  // 期待値がマイナスになるのは、ボーダー(18)に対して当たりの平均出玉が不足しているためです
  const avgRUSHBalls = jackpotCounts > 0 ? (totalJackpotBalls - (jackpotCounts * firstBonus)) / jackpotCounts : 0;
  const avgTotalBallsPerHit = firstBonus + avgRUSHBalls;
  const expectedValuePerSpin = (hitProb * avgTotalBallsPerHit) - consumptionPerSpin;
  const totalExpectedValue = Math.floor(expectedValuePerSpin * totalSpins * exchangeRate);

  return {
    history,
    stats: {
      maxCombo, jackpotCounts, totalJackpotBalls, maxJackpotBalls,
      avgCombo: jackpotCounts > 0 ? (totalComboCount / jackpotCounts).toFixed(1) : 0,
      avgJackpotBalls: jackpotCounts > 0 ? Math.floor(totalJackpotBalls / jackpotCounts) : 0,
      totalExpectedValue
    }
  };
}

function getPayout(payoutList) {
  const r = Math.random() * 100;
  let acc = 0;
  for (const p of payoutList) {
    acc += p.rate;
    if (r <= acc) return p.balls;
  }
  return payoutList[payoutList.length - 1]?.balls || 0;
}