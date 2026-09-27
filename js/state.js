/* ===================================================================
   state.js — الحالة المركزية للعبة (Game State)
   كل الملفات الأخرى تقرأ/تعدّل هذا الكائن فقط، ولا تحتفظ بنسخ خاصة
   من البيانات حتى تبقى اللعبة متوافقة مع مصدر واحد للحقيقة.
   =================================================================== */

const Game = {};

/* -----------------------------------------------------------------
   إعدادات قابلة للتعديل بسهولة (نقاط غير محددة صراحة في المواصفات
   تم اتخاذ قرار واضح بشأنها هنا، ويمكن تغييرها من هذا المكان فقط)
   ----------------------------------------------------------------- */
Game.CONFIG = {
  WIN_SCORE: 20,
  TEAM1_TIME: 5 * 60,      // 5 دقائق
  TEAM2_TIME: 60,          // دقيقة واحدة
  SEARCH_TIME: 15,         // 15 ثانية
  ROUNDS_PER_CYCLE: 2,     // بعد كل جولتين (فريق أول + فريق ثاني) → نرد + اختيار مجال
  CORRECT_TEAM1_POINTS: 2,
  CORRECT_TEAM2_POINTS: 1,
  DOUBLE_MULTIPLIER: 2,    // ×2 على نقاط الإجابة الصحيحة أو الخاطئة عند استخدام المضاعفة
  ASSIST_STARTING_COUNT: 2,
  DICE_RESULTS: [
    { label: "+1 نقطة", type: "add", value: 1 },
    { label: "+2 نقطة", type: "add", value: 2 },
    { label: "+4 نقاط", type: "add", value: 4 },
    { label: "-2 نقطة", type: "add", value: -2 },
    { label: "-4 نقاط", type: "add", value: -4 },
    { label: "سرقة نقطتين من الفريق الآخر", type: "steal", value: 2 }
  ]
};

/* -----------------------------------------------------------------
   الحالة الفعلية للعبة
   ----------------------------------------------------------------- */
Game.state = {
  judgeName: "",
  players: [],              // ["اسم1", "اسم2", ...]

  team1: [],
  team2: [],
  sharedPlayer: null,       // اسم اللاعب المشترك إن وجد

  scores: { team1: 0, team2: 0 },

  currentCategory: null,    // "countries" | "foods"
  usedQuestionKeys: { countries: [], foods: [] }, // منع تكرار الأسئلة

  currentQuestion: null,    // { emojis, answer, isManual }
  currentAnsweringTeam: 1,  // 1 أو 2
  startingTeamThisRound: 1, // من بدأ هذه الجولة (لتحديد التناوب)

  roundsCompletedInCycle: 0, // يصفّر بعد كل شاشة نرد/اختيار مجال

  assists: {
    team1: { double: Game.CONFIG.ASSIST_STARTING_COUNT, search: Game.CONFIG.ASSIST_STARTING_COUNT, dice: Game.CONFIG.ASSIST_STARTING_COUNT },
    team2: { double: Game.CONFIG.ASSIST_STARTING_COUNT, search: Game.CONFIG.ASSIST_STARTING_COUNT, dice: Game.CONFIG.ASSIST_STARTING_COUNT }
  },
  doubleActiveThisAttempt: { team1: false, team2: false },

  isDecisiveRound: false,
  isGameOver: false,
  winner: null              // 1 أو 2
};

/* إعادة كل شيء لحالته الابتدائية (تُستخدم فقط عند الضغط على "إعادة اللعب") */
Game.resetState = function () {
  Game.state.judgeName = "";
  Game.state.players = [];
  Game.state.team1 = [];
  Game.state.team2 = [];
  Game.state.sharedPlayer = null;
  Game.state.scores = { team1: 0, team2: 0 };
  Game.state.currentCategory = null;
  Game.state.usedQuestionKeys = { countries: [], foods: [] };
  Game.state.currentQuestion = null;
  Game.state.currentAnsweringTeam = 1;
  Game.state.startingTeamThisRound = 1;
  Game.state.roundsCompletedInCycle = 0;
  Game.state.assists = {
    team1: { double: Game.CONFIG.ASSIST_STARTING_COUNT, search: Game.CONFIG.ASSIST_STARTING_COUNT, dice: Game.CONFIG.ASSIST_STARTING_COUNT },
    team2: { double: Game.CONFIG.ASSIST_STARTING_COUNT, search: Game.CONFIG.ASSIST_STARTING_COUNT, dice: Game.CONFIG.ASSIST_STARTING_COUNT }
  };
  Game.state.doubleActiveThisAttempt = { team1: false, team2: false };
  Game.state.isDecisiveRound = false;
  Game.state.isGameOver = false;
  Game.state.winner = null;
};
