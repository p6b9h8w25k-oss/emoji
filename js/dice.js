/* ===================================================================
   dice.js — مساعدة النرد المستقلة (لا تُستخدم أثناء السؤال).
   تظهر بعد جولة الفريق الأول وجولة الفريق الثاني، قبل شاشة اختيار
   المجال التالي، بثلاثة خيارات: الفريق الأول / الفريق الثاني / الاثنان.
   =================================================================== */

Game.dice = {};

Game.dice.teamHasUses = function (team) {
  return Game.state.assists["team" + team].dice > 0;
};

Game.dice.bothTeamsOutOfUses = function () {
  return !Game.dice.teamHasUses(1) && !Game.dice.teamHasUses(2);
};

Game.dice.rollOnce = function () {
  const results = Game.CONFIG.DICE_RESULTS;
  return results[Math.floor(Math.random() * results.length)];
};

/* يطبّق نتيجة نرد واحدة على فريق معيّن */
Game.dice.applyResult = function (team, result) {
  const otherTeam = team === 1 ? 2 : 1;
  if (result.type === "steal") {
    Game.scoring.addPoints(team, result.value);
    Game.scoring.addPoints(otherTeam, -result.value);
  } else {
    Game.scoring.addPoints(team, result.value);
  }
};

/* استخدام النرد لفريق واحد: يخصم استخدامًا، يُدير الأنيميشن، ثم يطبّق النتيجة */
Game.dice.useForTeam = function (team, onDone) {
  if (!Game.dice.teamHasUses(team)) return;
  Game.state.assists["team" + team].dice -= 1;
  Game.ui.renderAssists();

  Game.ui.playDiceAnimation(function () {
    const result = Game.dice.rollOnce();
    Game.dice.applyResult(team, result);
    Game.ui.showDiceResult(team, result);
    if (onDone) onDone();
  });
};

/* استخدام النرد لكلا الفريقين: رمية للفريق الأول ثم رمية للفريق الثاني */
Game.dice.useForBoth = function (onDone) {
  Game.dice.useForTeam(1, function () {
    setTimeout(function () {
      if (Game.dice.teamHasUses(2)) {
        Game.dice.useForTeam(2, onDone);
      } else if (onDone) {
        onDone();
      }
    }, 1400);
  });
};
