/* ===================================================================
   timerManager.js — مؤقت عام قابل لإعادة الاستخدام لكل الحالات:
   وقت الفريق الأول، وقت الفريق الثاني، ووقت مساعدة البحث.
   =================================================================== */

Game.timerManager = {
  _intervalId: null,
  _remaining: 0,
  _onTick: null,
  _onExpire: null
};

/* يوقف أي مؤقت قديم لمنع استمراره بعد الانتقال للسؤال التالي */
Game.timerManager.stop = function () {
  if (Game.timerManager._intervalId) {
    clearInterval(Game.timerManager._intervalId);
    Game.timerManager._intervalId = null;
  }
};

Game.timerManager.start = function (seconds, onTick, onExpire) {
  Game.timerManager.stop(); // ضمان عدم وجود أكثر من مؤقت شغّال بنفس الوقت
  Game.timerManager._remaining = seconds;
  Game.timerManager._onTick = onTick;
  Game.timerManager._onExpire = onExpire;

  onTick(Game.timerManager._remaining);

  Game.timerManager._intervalId = setInterval(function () {
    Game.timerManager._remaining -= 1;
    if (Game.timerManager._remaining <= 0) {
      Game.timerManager.stop();
      onTick(0);
      if (onExpire) onExpire();
    } else {
      onTick(Game.timerManager._remaining);
    }
  }, 1000);
};

Game.timerManager.formatTime = function (totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return m + ":" + s;
};
