/* ===================================================================
   teamAssignment.js — توزيع اللاعبين عشوائيًا إلى فريقين
   - عدد زوجي: تقسيم متساوٍ تمامًا
   - عدد فردي: فريقان متساويان في العدد الأصغر الممكن + لاعب مشترك
     بينهما (يُختار عشوائيًا) — طريقة الاختيار غير معروفة للمستخدم
     مسبقًا لأن كل شيء يحدث داخل الكود بعد الضغط على "متابعة".
   =================================================================== */

Game.teamAssignment = {};

/* خلط عشوائي (Fisher–Yates) */
Game.teamAssignment._shuffle = function (arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
};

Game.teamAssignment.assignTeams = function (players) {
  const shuffled = Game.teamAssignment._shuffle(players);
  const n = shuffled.length;

  if (n % 2 === 0) {
    // عدد زوجي → تقسيم متساوٍ تمامًا، بدون لاعب مشترك
    const half = n / 2;
    Game.state.team1 = shuffled.slice(0, half);
    Game.state.team2 = shuffled.slice(half);
    Game.state.sharedPlayer = null;
  } else {
    // عدد فردي → كل فريق بنفس العدد (n+1)/2، مع لاعب مشترك واحد
    const teamSize = (n + 1) / 2;
    const distinct1 = shuffled.slice(0, teamSize - 1);
    const distinct2 = shuffled.slice(teamSize - 1, n - 1);
    const shared = shuffled[n - 1]; // اختيار اللاعب المشترك عشوائي بالكامل (نتيجة الخلط)

    Game.state.team1 = distinct1.concat([shared]);
    Game.state.team2 = distinct2.concat([shared]);
    Game.state.sharedPlayer = shared;
  }
};

/* أنيميشن لطيف لعرض توزيع اللاعبين قبل إظهار القوائم النهائية */
Game.teamAssignment.playRevealAnimation = function () {
  const spinner = document.getElementById("teams-shuffling");
  const result = document.getElementById("teams-result");
  spinner.classList.remove("hidden");
  result.classList.add("hidden");

  setTimeout(function () {
    spinner.classList.add("hidden");
    result.classList.remove("hidden");
    Game.ui.renderTeams();
  }, 1600);
};
