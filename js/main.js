/* ===================================================================
   main.js — تهيئة اللعبة وربط كل الأزرار الثابتة بأحداثها
   =================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* شاشة البداية */
  document.getElementById("start-game-btn").addEventListener("click", function () {
    Game.ui.resetSetupForm();
    Game.ui.goToScreen("setup");
  });

  /* شاشة إدخال اللاعبين */
  Game.playerSetup.renderPlayerInputs();
  document.getElementById("add-player-btn").addEventListener("click", Game.playerSetup.addPlayerField);
  document.getElementById("continue-setup-btn").addEventListener("click", Game.playerSetup.handleContinue);

  /* شاشة الفرق */
  document.getElementById("teams-next-btn").addEventListener("click", function () {
    Game.roundManager.startGameLoop();
  });

  /* شاشة مصدر الأسئلة */
  document.getElementById("source-system-btn").addEventListener("click", Game.roundManager.chooseSystemSource);
  document.getElementById("source-manual-btn").addEventListener("click", Game.roundManager.chooseManualSource);

  /* شاشة السؤال اليدوي */
  document.getElementById("manual-submit-btn").addEventListener("click", function () {
    const emojis = document.getElementById("manual-emojis-input").value;
    const answer = document.getElementById("manual-answer-input").value;
    Game.roundManager.submitManualQuestion(emojis, answer);
  });

  /* شاشة معاينة الحكم */
  document.getElementById("begin-round-btn").addEventListener("click", Game.roundManager.beginRound);

  /* شاشة اللعب */
  document.getElementById("toggle-judge-panel-btn").addEventListener("click", Game.ui.toggleJudgePanel);
  document.getElementById("reveal-answer-btn").addEventListener("click", Game.ui.toggleAnswerReveal);
  document.getElementById("btn-correct").addEventListener("click", Game.roundManager.judgeMarksCorrect);
  document.getElementById("btn-wrong").addEventListener("click", Game.roundManager.judgeMarksWrong);

  document.getElementById("assist-double-btn").addEventListener("click", function () {
    Game.assists.useDouble(Game.state.currentAnsweringTeam);
  });
  document.getElementById("assist-search-btn").addEventListener("click", function () {
    Game.assists.useSearch(Game.state.currentAnsweringTeam, function () { /* الحكم يقرر يدويًا بعد البحث */ });
  });

  /* شاشة نتيجة الجولة */
  document.getElementById("result-next-btn").addEventListener("click", Game.roundManager.afterRoundResult);

  /* شاشة النرد */
  document.getElementById("dice-team1-btn").addEventListener("click", function () { Game.roundManager.diceForTeam(1); });
  document.getElementById("dice-team2-btn").addEventListener("click", function () { Game.roundManager.diceForTeam(2); });
  document.getElementById("dice-both-btn").addEventListener("click", Game.roundManager.diceForBoth);

  /* الجولة الحاسمة */
  document.getElementById("decisive-reveal-btn").addEventListener("click", Game.ui.toggleDecisiveAnswerReveal);
  document.getElementById("decisive-team1-btn").addEventListener("click", function () { Game.roundManager.decisiveWinner(1); });
  document.getElementById("decisive-team2-btn").addEventListener("click", function () { Game.roundManager.decisiveWinner(2); });

  /* شاشة الفوز */
  document.getElementById("replay-btn").addEventListener("click", Game.roundManager.replay);

  /* شاشة البداية هي الافتراضية */
  Game.ui.goToScreen("splash");
});
