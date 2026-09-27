/* ===================================================================
   questionManager.js — اختيار سؤال عشوائي غير مستخدم، أو استقبال سؤال
   يدوي من الحكم، مع ضمان عدم تكرار أي سؤال طوال المباراة بالكامل.
   =================================================================== */

Game.questionManager = {};

/* مفتاح فريد لكل سؤال (يُستخدم لتتبع الأسئلة المستخدمة) */
Game.questionManager._keyOf = function (q) {
  return q.emojis + "|" + q.answer;
};

/* هل ما زال هناك أسئلة نظام متاحة (غير مستخدمة) لهذا المجال؟ */
Game.questionManager.hasAvailableSystemQuestions = function (category) {
  const pool = QUESTION_DATA[category];
  const used = Game.state.usedQuestionKeys[category];
  return pool.some(function (q) {
    return used.indexOf(Game.questionManager._keyOf(q)) === -1;
  });
};

/* يسحب سؤالًا عشوائيًا غير مستخدم من مجال معيّن */
Game.questionManager.pickRandomSystemQuestion = function (category) {
  const pool = QUESTION_DATA[category];
  const used = Game.state.usedQuestionKeys[category];
  const available = pool.filter(function (q) {
    return used.indexOf(Game.questionManager._keyOf(q)) === -1;
  });
  if (!available.length) return null;
  const choice = available[Math.floor(Math.random() * available.length)];
  return { emojis: choice.emojis, answer: choice.answer, isManual: false };
};

/* سؤال يدوي من الحكم */
Game.questionManager.buildManualQuestion = function (emojis, answer) {
  return { emojis: emojis.trim(), answer: answer.trim(), isManual: true };
};

/* يقفل السؤال الحالي كمستخدم بحيث لا يظهر مجددًا طوال المباراة،
   حتى لو مرّ من الفريق الأول إلى الفريق الثاني (فهذا لا يُعتبر
   سؤالًا جديدًا أصلًا لأننا لا نسحب سؤالًا آخر عند الانتقال). */
Game.questionManager.markCurrentQuestionUsed = function () {
  const q = Game.state.currentQuestion;
  const category = Game.state.currentCategory;
  if (!q || q.isManual) return; // الأسئلة اليدوية لا تُسحب من البنك أصلًا
  const key = Game.questionManager._keyOf(q);
  if (Game.state.usedQuestionKeys[category].indexOf(key) === -1) {
    Game.state.usedQuestionKeys[category].push(key);
  }
};

/* يبني سؤالًا حاسمًا جديدًا لم يُستخدم من أي من المجالين */
Game.questionManager.pickDecisiveQuestion = function () {
  const categories = ["countries", "foods"];
  const shuffledCats = Game.teamAssignment._shuffle(categories);
  for (let i = 0; i < shuffledCats.length; i++) {
    const cat = shuffledCats[i];
    if (Game.questionManager.hasAvailableSystemQuestions(cat)) {
      Game.state.currentCategory = cat;
      return Game.questionManager.pickRandomSystemQuestion(cat);
    }
  }
  return null; // نادرًا جدًا: نفدت كل الأسئلة في المجالين
};
