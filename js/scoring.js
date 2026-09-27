/* ===================================================================
   scoring.js — تحديث النقاط، والتحقق من شروط الفوز.
   ملاحظة مهمة: نقاط الإجابة (2 أو 1) تعتمد على "دور" الفريق في هذه
   الجولة تحديدًا (هل هو الفريق البادئ أم الفريق الثاني الذي جاءه
   السؤال بعد خطأ الأول) — وليس على رقم الفريق الثابت. الفريق البادئ
   يتغيّر بالتناوب بين الجولات (راجع roundManager.js).
   =================================================================== */

Game.scoring = {};

Game.scoring.addPoints = function (team, amount) {
  const key = "team" + team;
  Game.state.scores[key] += amount;
  Game.ui.updateScoreboard();
};

Game.scoring.isStartingTeam = function (team) {
  return team === Game.state.startingTeamThisRound;
};

/* نقاط الإجابة الصحيحة/الخاطئة، مع مراعاة مضاعفة النقاط إن كانت مفعّلة
   لهذا الفريق في هذه المحاولة تحديدًا. */
Game.scoring.applyAnswerResult = function (team, isCorrect) {
  const doubled = Game.state.doubleActiveThisAttempt["team" + team];
  const basePoints = Game.scoring.isStartingTeam(team)
    ? Game.CONFIG.CORRECT_TEAM1_POINTS   // 2 نقاط لدور الفريق البادئ
    : Game.CONFIG.CORRECT_TEAM2_POINTS;  // 1 نقطة لدور الفريق الثاني

  let points = isCorrect ? basePoints : 0;

  if (doubled) {
    points = isCorrect
      ? basePoints * Game.CONFIG.DOUBLE_MULTIPLIER
      : -(basePoints * Game.CONFIG.DOUBLE_MULTIPLIER);
  }

  Game.scoring.addPoints(team, points);
  return points;
};

/* التحقق من الوصول إلى نقطة الفوز (20 أو أكثر) لكلا الفريقين معًا */
Game.scoring.checkWinCondition = function () {
  const s1 = Game.state.scores.team1;
  const s2 = Game.state.scores.team2;
  const win = Game.CONFIG.WIN_SCORE;

  const t1Reached = s1 >= win;
  const t2Reached = s2 >= win;

  if (t1Reached && t2Reached) return "tie"; // جولة حاسمة
  if (t1Reached) return 1;
  if (t2Reached) return 2;
  return null;
};
