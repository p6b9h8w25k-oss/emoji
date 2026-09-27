/* ===================================================================
   playerSetup.js — إدخال اسم الحكم وأسماء اللاعبين + التحقق من الأخطاء
   =================================================================== */

Game.playerSetup = {};

/* يبني حقول إدخال أسماء اللاعبين ديناميكيًا */
Game.playerSetup.renderPlayerInputs = function () {
  const container = document.getElementById("players-list");
  container.innerHTML = "";
  const count = Game.playerSetup._inputCount || 2;
  for (let i = 0; i < count; i++) {
    Game.playerSetup._addPlayerRow(container, i);
  }
};

Game.playerSetup._addPlayerRow = function (container, index) {
  const row = document.createElement("div");
  row.className = "player-row";
  row.innerHTML =
    '<input type="text" class="player-input neu-input" placeholder="اسم اللاعب ' + (index + 1) + '">' +
    '<button type="button" class="remove-player-btn neu-btn-sm" aria-label="حذف اللاعب">✕</button>';
  row.querySelector(".remove-player-btn").addEventListener("click", function () {
    if (container.children.length > 2) {
      row.remove();
    }
  });
  container.appendChild(row);
};

Game.playerSetup.addPlayerField = function () {
  const container = document.getElementById("players-list");
  Game.playerSetup._addPlayerRow(container, container.children.length);
};

/* يقرأ القيم المدخلة الآن من DOM */
Game.playerSetup.collectInputs = function () {
  const judgeName = document.getElementById("judge-name-input").value.trim();
  const playerInputs = document.querySelectorAll("#players-list .player-input");
  const players = [];
  playerInputs.forEach(function (input) {
    const v = input.value.trim();
    if (v) players.push(v);
  });
  return { judgeName: judgeName, players: players };
};

/* التحقق من صحة المدخلات حسب القواعد:
   - لا يمكن بدء اللعبة بدون حكم
   - لا يمكن بدء اللعبة بدون أسماء
   - لا يمكن بدء اللعبة بأقل من لاعبين (لاعبان على الأقل) */
Game.playerSetup.validate = function (data) {
  const errors = [];
  if (!data.judgeName) errors.push("الرجاء إدخال اسم الحكم.");
  if (data.players.length < 2) errors.push("يجب إدخال اسمين على الأقل للاعبين.");
  const hasEmpty = data.players.some(function (p) { return !p; });
  if (hasEmpty) errors.push("لا يمكن ترك اسم لاعب فارغًا.");
  return errors;
};

Game.playerSetup.showErrors = function (errors) {
  const box = document.getElementById("setup-errors");
  if (!errors.length) {
    box.textContent = "";
    box.classList.remove("visible");
    return;
  }
  box.textContent = errors.join(" ");
  box.classList.add("visible");
};

/* يُستدعى عند الضغط على "متابعة" في شاشة إدخال اللاعبين */
Game.playerSetup.handleContinue = function () {
  const data = Game.playerSetup.collectInputs();
  const errors = Game.playerSetup.validate(data);
  Game.playerSetup.showErrors(errors);
  if (errors.length) return;

  Game.state.judgeName = data.judgeName;
  Game.state.players = data.players;

  Game.teamAssignment.assignTeams(data.players);
  Game.ui.goToScreen("teams");
  Game.teamAssignment.playRevealAnimation();
};
