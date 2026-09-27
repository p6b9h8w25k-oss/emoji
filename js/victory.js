/* ===================================================================
   victory.js — تأثير الاحتفال البصري عند الفوز (قصاصات ملونة CSS)
   =================================================================== */

Game.victory = {};

Game.victory.launchConfetti = function (container) {
  const colors = ["#ffd166", "#ef476f", "#06d6a0", "#118ab2", "#ffffff"];
  const count = 60;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 0.6) + "s";
    piece.style.animationDuration = (2.2 + Math.random() * 1.6) + "s";
    piece.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
    container.appendChild(piece);
  }
  setTimeout(function () { container.innerHTML = ""; }, 4200);
};
