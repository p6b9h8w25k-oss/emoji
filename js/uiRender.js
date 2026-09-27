/* ===================================================================
   uiRender.js — كل التعامل مع DOM يمر من هنا فقط (Screen switching +
   تحديث كل عناصر الواجهة). لا منطق لعبة هنا، فقط عرض.
   =================================================================== */

Game.ui = {};

const ALL_SCREENS = [
  "splash", "setup", "teams", "category", "source", "manual",
  "judge-prep", "play", "result", "dice", "decisive", "victory"
];

const TOPBAR_SCREENS = [
  "category", "source", "manual", "judge-prep", "play", "result", "dice", "decisive"
];

Game.ui.goToScreen = function (name) {
  ALL_SCREENS.forEach(function (s) {
    const el = document.getElementById("screen-" + s);
    if (el) el.classList.toggle("active", s === name);
  });
  const topbar = document.getElementById("topbar");
  topbar.classList.toggle("visible", TOPBAR_SCREENS.indexOf(name) !== -1);
  window.scrollTo(0, 0);
};

/* ---------------- شاشة الفرق ---------------- */
Game.ui.renderTeams = function () {
  document.getElementById("team1-list").innerHTML = Game.state.team1.map(function (n) {
    return "<li>" + Game.ui._escape(n) + (n === Game.state.sharedPlayer ? ' <span class="shared-tag">مشترك</span>' : "") + "</li>";
  }).join("");
  document.getElementById("team2-list").innerHTML = Game.state.team2.map(function (n) {
    return "<li>" + Game.ui._escape(n) + (n === Game.state.sharedPlayer ? ' <span class="shared-tag">مشترك</span>' : "") + "</li>";
  }).join("");

  const note = document.getElementById("shared-player-note");
  if (Game.state.sharedPlayer) {
    note.textContent = "🔗 اللاعب المشترك بين الفريقين: " + Game.state.sharedPlayer;
    note.classList.remove("hidden");
  } else {
    note.classList.add("hidden");
  }
};

/* ---------------- شاشة اختيار المجال ---------------- */
Game.ui.renderCategoryChoice = function () {
  const container = document.getElementById("category-options");
  container.innerHTML = "";

  if (!Game.state.currentCategory) {
    container.appendChild(Game.ui._makeBtn("🌍 الدول", function () { Game.roundManager.chooseCategory("countries"); }));
    container.appendChild(Game.ui._makeBtn("🍔 الأكلات", function () { Game.roundManager.chooseCategory("foods"); }));
  } else {
    const current = Game.state.currentCategory;
    const other = Game.categorySwitch.otherCategory();
    container.appendChild(Game.ui._makeBtn(
      "الاستمرار في " + Game.categorySwitch.labelOf(current),
      function () { Game.roundManager.chooseCategory(current); }
    ));
    container.appendChild(Game.ui._makeBtn(
      "الانتقال إلى " + Game.categorySwitch.labelOf(other),
      function () { Game.roundManager.chooseCategory(other); }
    ));
  }
};

Game.ui._makeBtn = function (label, onClick) {
  const b = document.createElement("button");
  b.className = "big-btn neu-btn";
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
};

/* ---------------- شاشة مصدر الأسئلة ---------------- */
Game.ui.renderSourceChoice = function () {
  document.getElementById("source-error").textContent = "";
  document.getElementById("source-category-label").textContent =
    "المجال الحالي: " + Game.categorySwitch.labelOf(Game.state.currentCategory);
};

Game.ui.showSourceError = function (msg) {
  document.getElementById("source-error").textContent = msg;
};

/* ---------------- شاشة السؤال اليدوي ---------------- */
Game.ui.renderManualForm = function () {
  document.getElementById("manual-emojis-input").value = "";
  document.getElementById("manual-answer-input").value = "";
  document.getElementById("manual-error").textContent = "";
};

Game.ui.showManualError = function (msg) {
  document.getElementById("manual-error").textContent = msg;
};

/* ---------------- معاينة الحكم قبل بدء الجولة ---------------- */
Game.ui.renderJudgePrep = function () {
  const q = Game.state.currentQuestion;
  document.getElementById("prep-category-label").textContent = Game.categorySwitch.labelOf(Game.state.currentCategory);
  document.getElementById("prep-emojis").textContent = q.emojis;
  document.getElementById("prep-answer").textContent = q.answer;
  const startingName = Game.state.startingTeamThisRound === 1 ? "الفريق الأول" : "الفريق الثاني";
  document.getElementById("prep-starting-team").textContent = "يبدأ هذه الجولة: " + startingName;
};

/* ---------------- شاشة اللعب ---------------- */
Game.ui.renderPlayScreen = function () {
  const team = Game.state.currentAnsweringTeam;
  const isStarter = Game.scoring.isStartingTeam(team);
  const teamName = team === 1 ? "الفريق الأول" : "الفريق الثاني";
  const members = team === 1 ? Game.state.team1 : Game.state.team2;

  const label = document.getElementById("play-team-label");
  label.textContent = "🎯 دور " + teamName + (isStarter ? "" : " (بعد خطأ الفريق الآخر)");
  label.className = "play-team-label team-" + team;

  document.getElementById("play-team-members").textContent = members.join(" • ");
  document.getElementById("play-emojis").textContent = Game.state.currentQuestion.emojis;

  Game.ui.hideAnswerFromJudgePanel();
  document.getElementById("judge-panel").classList.add("collapsed");
  Game.ui.renderAssists();

  // أنيميشن انتقال بسيط عند تغيّر الفريق
  const stage = document.getElementById("play-stage");
  stage.classList.remove("team-switch-anim");
  void stage.offsetWidth;
  stage.classList.add("team-switch-anim");
};

Game.ui.updateTimerDisplay = function (seconds) {
  const el = document.getElementById("timer-display");
  el.textContent = Game.timerManager.formatTime(seconds);
  el.classList.toggle("timer-warning", seconds <= 10 && seconds > 0);
  el.classList.toggle("timer-danger", seconds === 0);
};

Game.ui.hideAnswerFromJudgePanel = function () {
  const reveal = document.getElementById("judge-answer-text");
  reveal.textContent = "••••••";
  reveal.classList.remove("revealed");
};

Game.ui.toggleJudgePanel = function () {
  document.getElementById("judge-panel").classList.toggle("collapsed");
};

Game.ui.toggleAnswerReveal = function () {
  const reveal = document.getElementById("judge-answer-text");
  if (reveal.classList.contains("revealed")) {
    reveal.textContent = "••••••";
    reveal.classList.remove("revealed");
  } else {
    reveal.textContent = Game.state.currentQuestion.answer;
    reveal.classList.add("revealed");
  }
};

Game.ui.flashAnswerResult = function (isCorrect) {
  const flash = document.getElementById("answer-flash");
  flash.textContent = isCorrect ? "✅ إجابة صحيحة!" : "❌ إجابة خاطئة";
  flash.className = "answer-flash show " + (isCorrect ? "flash-correct" : "flash-wrong");
  setTimeout(function () { flash.className = "answer-flash"; }, 850);
};

/* ---------------- المساعدات (مضاعفة/بحث) على شاشة اللعب + شارات دائمة ---------------- */
Game.ui.renderAssists = function () {
  const team = Game.state.currentAnsweringTeam;
  const a = Game.state.assists["team" + team];

  const doubleBtn = document.getElementById("assist-double-btn");
  const searchBtn = document.getElementById("assist-search-btn");
  doubleBtn.querySelector(".count").textContent = a.double;
  searchBtn.querySelector(".count").textContent = a.search;
  doubleBtn.disabled = a.double <= 0 || Game.state.doubleActiveThisAttempt["team" + team];
  searchBtn.disabled = a.search <= 0;
  doubleBtn.classList.toggle("assist-active", Game.state.doubleActiveThisAttempt["team" + team]);

  // شارات دائمة لرصيد الفريقين (تظهر دائمًا بغض النظر عن الدور الحالي)
  ["team1", "team2"].forEach(function (key) {
    const badges = document.getElementById("badges-" + key);
    if (!badges) return;
    const d = Game.state.assists[key];
    badges.innerHTML =
      '<span title="مضاعفة النقاط">×2 ' + d.double + '</span>' +
      '<span title="البحث">🔍 ' + d.search + '</span>' +
      '<span title="النرد">🎲 ' + d.dice + '</span>';
  });
};

Game.ui.updateScoreboard = function () {
  document.getElementById("mini-score-team1").textContent = Game.state.scores.team1;
  document.getElementById("mini-score-team2").textContent = Game.state.scores.team2;
};

Game.ui.showSearchOverlay = function () {
  document.getElementById("search-overlay").classList.add("visible");
};
Game.ui.updateSearchOverlay = function (seconds) {
  document.getElementById("search-countdown").textContent = seconds;
};
Game.ui.hideSearchOverlay = function () {
  document.getElementById("search-overlay").classList.remove("visible");
};

/* ---------------- شاشة نتيجة الجولة ---------------- */
Game.ui.renderRoundResult = function (wasCorrect, team, pointsChange) {
  const teamName = team === 1 ? "الفريق الأول" : "الفريق الثاني";
  document.getElementById("result-icon").textContent = wasCorrect ? "✅" : "❌";
  document.getElementById("result-text").textContent =
    teamName + (wasCorrect ? " أجاب بشكل صحيح! " : " أجاب بشكل خاطئ. ") +
    (pointsChange >= 0 ? "+" : "") + pointsChange + " نقطة";
  document.getElementById("result-answer").textContent = "✨ الإجابة الصحيحة: " + Game.state.currentQuestion.answer;
  document.getElementById("result-score-1").textContent = Game.state.scores.team1;
  document.getElementById("result-score-2").textContent = Game.state.scores.team2;
};

/* ---------------- شاشة النرد ---------------- */
Game.ui.renderDiceScreen = function () {
  document.getElementById("dice-result-text").textContent = "";
  document.getElementById("dice-face").textContent = "🎲";
  const t1btn = document.getElementById("dice-team1-btn");
  const t2btn = document.getElementById("dice-team2-btn");
  const bothBtn = document.getElementById("dice-both-btn");
  t1btn.disabled = !Game.dice.teamHasUses(1);
  t2btn.disabled = !Game.dice.teamHasUses(2);
  bothBtn.disabled = !(Game.dice.teamHasUses(1) && Game.dice.teamHasUses(2));
  t1btn.querySelector(".count").textContent = Game.state.assists.team1.dice;
  t2btn.querySelector(".count").textContent = Game.state.assists.team2.dice;
};

Game.ui.disableDiceButtons = function () {
  ["dice-team1-btn", "dice-team2-btn", "dice-both-btn"].forEach(function (id) {
    document.getElementById(id).disabled = true;
  });
};

Game.ui.playDiceAnimation = function (onComplete) {
  const face = document.getElementById("dice-face");
  face.classList.add("dice-rolling");
  setTimeout(function () {
    face.classList.remove("dice-rolling");
    onComplete();
  }, 1100);
};

Game.ui.showDiceResult = function (team, result) {
  const teamName = team === 1 ? "الفريق الأول" : "الفريق الثاني";
  document.getElementById("dice-result-text").textContent =
    "🎲 " + teamName + ": " + result.label;
};

/* ---------------- الجولة الحاسمة ---------------- */
Game.ui.renderDecisiveScreen = function () {
  const q = Game.state.currentQuestion;
  document.getElementById("decisive-emojis").textContent = q ? q.emojis : "—";
  const reveal = document.getElementById("decisive-answer-text");
  reveal.textContent = "••••••";
  reveal.classList.remove("revealed");
};

Game.ui.toggleDecisiveAnswerReveal = function () {
  const reveal = document.getElementById("decisive-answer-text");
  if (reveal.classList.contains("revealed")) {
    reveal.textContent = "••••••";
    reveal.classList.remove("revealed");
  } else {
    reveal.textContent = Game.state.currentQuestion ? Game.state.currentQuestion.answer : "—";
    reveal.classList.add("revealed");
  }
};

/* ---------------- شاشة الفوز ---------------- */
Game.ui.renderVictory = function (team) {
  const teamName = team === 1 ? "الفريق الأول" : "الفريق الثاني";
  const members = team === 1 ? Game.state.team1 : Game.state.team2;
  const otherScore = team === 1 ? Game.state.scores.team2 : Game.state.scores.team1;
  const winScore = team === 1 ? Game.state.scores.team1 : Game.state.scores.team2;

  document.getElementById("victory-title").textContent = "🏆 " + teamName + " فاز!";
  document.getElementById("victory-members").textContent = members.join(" • ");
  document.getElementById("victory-scores").textContent =
    "النتيجة النهائية — " + teamName + ": " + winScore + "   |   الفريق الآخر: " + otherScore;

  Game.victory.launchConfetti(document.getElementById("victory-confetti"));
};

/* ---------------- إعادة تعيين شاشة الإعداد ---------------- */
Game.ui.resetSetupForm = function () {
  document.getElementById("judge-name-input").value = "";
  Game.playerSetup._inputCount = 2;
  Game.playerSetup.renderPlayerInputs();
  Game.playerSetup.showErrors([]);
};

Game.ui._escape = function (str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};
