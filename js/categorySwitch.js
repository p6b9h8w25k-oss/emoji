/* ===================================================================
   categorySwitch.js — اختيار المجال أول مرة، والاستمرار/الانتقال
   بعد كل جولتين.
   =================================================================== */

Game.categorySwitch = {};

Game.categorySwitch.setCategory = function (category) {
  Game.state.currentCategory = category;
  Game.state.roundsCompletedInCycle = 0;
};

Game.categorySwitch.otherCategory = function () {
  return Game.state.currentCategory === "countries" ? "foods" : "countries";
};

Game.categorySwitch.labelOf = function (category) {
  return category === "countries" ? "🌍 الدول" : "🍔 الأكلات";
};
