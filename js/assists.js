/* ===================================================================
   assists.js — مساعدتا "مضاعفة النقاط" و"البحث" (مساعدة النرد في dice.js)
   كل نوع مساعدة له رصيد مستقل لكل فريق، ويمكن استخدام أكثر من مساعدة
   في نفس السؤال طالما الرصيد متاح.
   =================================================================== */

Game.assists = {};

Game.assists.hasBalance = function (team, type) {
  return Game.state.assists["team" + team][type] > 0;
};

Game.assists.useDouble = function (team) {
  if (!Game.assists.hasBalance(team, "double")) return false;
  Game.state.assists["team" + team].double -= 1;
  Game.state.doubleActiveThisAttempt["team" + team] = true;
  Game.ui.renderAssists();
  return true;
};

/* مساعدة البحث: تمنح 15 ثانية بحث، ثم تعود السيطرة للحكم لتحديد
   جاوب صح / جاب خطأ. لا تُخصم إلا مساعدة واحدة عند الاستخدام. */
Game.assists.useSearch = function (team, onFinished) {
  if (!Game.assists.hasBalance(team, "search")) return false;
  Game.state.assists["team" + team].search -= 1;
  Game.ui.renderAssists();

  Game.ui.showSearchOverlay();
  Game.timerManager.stop(); // إيقاف مؤقت الجولة الرئيسي أثناء وقت البحث

  const searchTimer = { remaining: Game.CONFIG.SEARCH_TIME };
  const intervalId = setInterval(function () {
    searchTimer.remaining -= 1;
    Game.ui.updateSearchOverlay(searchTimer.remaining);
    if (searchTimer.remaining <= 0) {
      clearInterval(intervalId);
      Game.ui.hideSearchOverlay();
      if (onFinished) onFinished();
    }
  }, 1000);
  Game.ui.updateSearchOverlay(searchTimer.remaining);

  return true;
};

/* إعادة ضبط علم "المضاعفة مفعّلة" بعد انتهاء كل محاولة إجابة */
Game.assists.resetDoubleFlag = function (team) {
  Game.state.doubleActiveThisAttempt["team" + team] = false;
};
