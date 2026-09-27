/* ===================================================================
   roundManager.js — قلب اللعبة: يربط كل الوحدات ببعضها ويدير الانتقال
   بين الشاشات حسب قواعد اللعبة بالضبط.
   =================================================================== */

Game.roundManager = { _locked: false };

/* ---------- بداية اللعبة بعد عرض الفرق ---------- */
Game.roundManager.startGameLoop = function () {
  Game.state.startingTeamThisRound = 1; // "الجولة الأولى تبدأ دائمًا مع الفريق الأول"
  Game.state.roundsCompletedInCycle = 0;
  Game.roundManager.goToCategoryChoice();
};

/* ---------- شاشة اختيار المجال ---------- */
Game.roundManager.goToCategoryChoice = function () {
  Game.ui.renderCategoryChoice();
  Game.ui.goToScreen("category");
};

Game.roundManager.chooseCategory = function (category) {
  Game.categorySwitch.setCategory(category);
  Game.roundManager.goToSourceChoice();
};

/* ---------- شاشة اختيار مصدر السؤال ---------- */
Game.roundManager.goToSourceChoice = function () {
  Game.ui.renderSourceChoice();
  Game.ui.goToScreen("source");
};

Game.roundManager.chooseSystemSource = function () {
  const q = Game.questionManager.pickRandomSystemQuestion(Game.state.currentCategory);
  if (!q) {
    Game.ui.showSourceError("لا توجد أسئلة نظام متبقية في هذا المجال. جرّب سؤالًا يدويًا.");
    return;
  }
  Game.state.currentQuestion = q;
  Game.roundManager.goToJudgePrep();
};

Game.roundManager.chooseManualSource = function () {
  Game.ui.renderManualForm();
  Game.ui.goToScreen("manual");
};

Game.roundManager.submitManualQuestion = function (emojis, answer) {
  if (!emojis.trim() || !answer.trim()) {
    Game.ui.showManualError("الرجاء إدخال الإيموجيات والإجابة الصحيحة.");
    return;
  }
  Game.state.currentQuestion = Game.questionManager.buildManualQuestion(emojis, answer);
  Game.roundManager.goToJudgePrep();
};

/* ---------- معاينة الحكم قبل بدء الجولة (يمنع كشف الإجابة للاعبين) ---------- */
Game.roundManager.goToJudgePrep = function () {
  Game.ui.renderJudgePrep();
  Game.ui.goToScreen("judge-prep");
};

/* ---------- بدء الجولة فعليًا ---------- */
Game.roundManager.beginRound = function () {
  Game.roundManager._locked = false;
  Game.state.currentAnsweringTeam = Game.state.startingTeamThisRound;
  Game.assists.resetDoubleFlag(1);
  Game.assists.resetDoubleFlag(2);
  Game.ui.hideAnswerFromJudgePanel();
  Game.ui.renderPlayScreen();
  Game.ui.goToScreen("play");
  Game.roundManager._startTimerForCurrentTeam();
};

Game.roundManager._startTimerForCurrentTeam = function () {
  const isStarter = Game.scoring.isStartingTeam(Game.state.currentAnsweringTeam);
  const duration = isStarter ? Game.CONFIG.TEAM1_TIME : Game.CONFIG.TEAM2_TIME;
  Game.timerManager.start(
    duration,
    Game.ui.updateTimerDisplay,
    Game.roundManager.handleTimeExpired
  );
};

/* ---------- انتهاء الوقت تلقائيًا = محاولة خاطئة ---------- */
Game.roundManager.handleTimeExpired = function () {
  if (Game.roundManager._locked) return;
  Game.roundManager._resolveAttempt(false);
};

/* ---------- أزرار الحكم: جاوب صح / جاب خطأ ---------- */
Game.roundManager.judgeMarksCorrect = function () {
  if (Game.roundManager._locked) return;
  Game.roundManager._resolveAttempt(true);
};

Game.roundManager.judgeMarksWrong = function () {
  if (Game.roundManager._locked) return;
  Game.roundManager._resolveAttempt(false);
};

/* منطق موحّد لمعالجة نتيجة أي محاولة (صحيحة/خاطئة/انتهاء وقت) */
Game.roundManager._resolveAttempt = function (isCorrect) {
  Game.roundManager._locked = true;
  Game.timerManager.stop();

  const team = Game.state.currentAnsweringTeam;
  const isStarterAttempt = Game.scoring.isStartingTeam(team);
  const pointsChange = Game.scoring.applyAnswerResult(team, isCorrect);
  Game.assists.resetDoubleFlag(team);

  Game.ui.flashAnswerResult(isCorrect);

  if (isCorrect) {
    // إجابة صحيحة (من أي فريق) تنهي الجولة فورًا
    setTimeout(function () { Game.roundManager._finalizeRound(true, team, pointsChange); }, 900);
    return;
  }

  if (isStarterAttempt) {
    // خطأ الفريق البادئ → ينتقل نفس السؤال للفريق الآخر بمهلة دقيقة واحدة
    const otherTeam = team === 1 ? 2 : 1;
    setTimeout(function () {
      Game.roundManager._locked = false;
      Game.state.currentAnsweringTeam = otherTeam;
      Game.ui.renderPlayScreen();
      Game.roundManager._startTimerForCurrentTeam();
    }, 900);
  } else {
    // خطأ الفريق الثاني → تنتهي الجولة وتظهر الإجابة للجميع
    setTimeout(function () { Game.roundManager._finalizeRound(false, team, pointsChange); }, 900);
  }
};

/* ---------- إنهاء الجولة وعرض النتيجة ---------- */
Game.roundManager._finalizeRound = function (wasCorrect, lastTeam, pointsChange) {
  Game.questionManager.markCurrentQuestionUsed();

  const winResult = Game.scoring.checkWinCondition();
  if (winResult === "tie") {
    Game.roundManager.startDecisiveRound();
    return;
  }
  if (winResult === 1 || winResult === 2) {
    Game.roundManager.declareVictory(winResult);
    return;
  }

  Game.ui.renderRoundResult(wasCorrect, lastTeam, pointsChange);
  Game.ui.goToScreen("result");
};

/* ---------- بعد الضغط على "التالي" في شاشة النتيجة ---------- */
Game.roundManager.afterRoundResult = function () {
  Game.roundManager._locked = false;
  Game.state.roundsCompletedInCycle += 1;
  Game.state.startingTeamThisRound = Game.state.startingTeamThisRound === 1 ? 2 : 1;

  if (Game.state.roundsCompletedInCycle >= Game.CONFIG.ROUNDS_PER_CYCLE) {
    Game.state.roundsCompletedInCycle = 0;
    Game.roundManager.goToDiceScreen();
  } else {
    Game.roundManager.goToSourceChoice();
  }
};

/* ---------- شاشة النرد ---------- */
Game.roundManager.goToDiceScreen = function () {
  if (Game.dice.bothTeamsOutOfUses()) {
    Game.roundManager.goToCategoryChoice();
    return;
  }
  Game.ui.renderDiceScreen();
  Game.ui.goToScreen("dice");
};

Game.roundManager.diceForTeam = function (team) {
  Game.ui.disableDiceButtons();
  Game.dice.useForTeam(team, Game.roundManager._afterDice);
};

Game.roundManager.diceForBoth = function () {
  Game.ui.disableDiceButtons();
  Game.dice.useForBoth(Game.roundManager._afterDice);
};

Game.roundManager._afterDice = function () {
  const winResult = Game.scoring.checkWinCondition();
  if (winResult === "tie") { Game.roundManager.startDecisiveRound(); return; }
  if (winResult === 1 || winResult === 2) { Game.roundManager.declareVictory(winResult); return; }
  setTimeout(function () { Game.roundManager.goToCategoryChoice(); }, 1200);
};

/* ---------- الجولة الحاسمة ---------- */
Game.roundManager.startDecisiveRound = function () {
  Game.state.isDecisiveRound = true;
  const q = Game.questionManager.pickDecisiveQuestion();
  Game.state.currentQuestion = q;
  Game.ui.renderDecisiveScreen();
  Game.ui.goToScreen("decisive");
};

Game.roundManager.decisiveWinner = function (team) {
  if (Game.state.currentQuestion) Game.questionManager.markCurrentQuestionUsed();
  Game.roundManager.declareVictory(team);
};

/* ---------- شاشة الفوز ---------- */
Game.roundManager.declareVictory = function (team) {
  Game.timerManager.stop();
  Game.state.isGameOver = true;
  Game.state.winner = team;
  Game.ui.renderVictory(team);
  Game.ui.goToScreen("victory");
};

/* ---------- إعادة اللعب ---------- */
Game.roundManager.replay = function () {
  Game.resetState();
  Game.ui.resetSetupForm();
  Game.ui.goToScreen("splash");
};
