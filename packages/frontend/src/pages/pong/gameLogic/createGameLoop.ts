// createGameLoop.ts
import { GameStateManager } from "./gameStateManager.ts";
import { GameConfig } from "./gameConfig.ts";
import { drawScene } from "../gameInterface/drawScene.ts";
import { handleEndGame } from "./endGame.ts";
import { mouseInputHandler } from "./mouseInputHandler.ts";
import { restartButtonHandler } from "./endGame.ts";
import { predictBallY, movePaddleAI } from "./aiMode";
import { CANVAS_WIDTH, CANVAS_HEIGHT, MS_PER_FRAME, AI_UPDATE_INTERVAL } from "../constants.ts";


export function createGameLoop(config: GameConfig) {
  const { canvas, paddle1, paddle2, ball, match, mode, username, tournamentMgr } = config;

  const stateMgr = new GameStateManager(match, ball, paddle1, paddle2, canvas);
  const restartButton = restartButtonHandler(mode, stateMgr, match, config);
  const mouseInput = new mouseInputHandler(canvas, restartButton);
  mouseInput.bind();
  let running = true;
  let lastTime = performance.now();
  let aiTimer = 0;
  let aiTargetY = CANVAS_HEIGHT / 2;

  // Initialisation tournoi
  if (mode === "tournament" && tournamentMgr) {
    match.setPlayers(tournamentMgr.nextMatch(username));
  }
  stateMgr.startNextMatchAnimation(match.playerLeft, match.playerRight);

  // --- Update functions ---
  function update(deltaMs: number) {
    switch (stateMgr.state) {
      case "starting":
        updateStartingState(deltaMs);
        break;
      case "playing":
        updatePlayingState(deltaMs);
        break;
    }
  }

  function updateStartingState(deltaMs: number) {
    stateMgr.startTimer += deltaMs;
    if (stateMgr.startTimer > 500) stateMgr.state = "playing";
  }

  function updatePlayingState(deltaMs: number) {
    if (stateMgr.state !== "playing") return;
    const deltaTime = deltaMs / MS_PER_FRAME;

    updateBall(deltaTime);
    paddle1.update(deltaTime);
    updateAI(deltaMs);
    paddle2.update(deltaTime);
  }

  function updateBall(deltaTime: number) {
    ball.update(paddle1, paddle2, (player) => {
      match.addPoint(player);
      ball.reset();   // ← repositionne la balle au centre
      if (match.isGameOver()) handleEndGame(config, mode, stateMgr, match);
    }, deltaTime);
  }

  function updateAI(deltaMs: number) {
    if (mode !== "ai") return;

    aiTimer += deltaMs;
    if (aiTimer >= AI_UPDATE_INTERVAL) {
      aiTimer = 0;
      aiTargetY = predictBallY(ball, paddle2);
    }
    movePaddleAI(paddle2, aiTargetY);
  }

  // --- Game loop ---
  function loop() {
    if (!running) return;

    const now = performance.now();
    const deltaMs = now - lastTime;
    lastTime = now;

    update(deltaMs);
    drawScene(canvas, paddle1, paddle2, ball, match, stateMgr, mouseInput.isHovering, mode);

    requestAnimationFrame(loop);
  }

  loop();

  // --- Cleanup ---
  return {
    togglePause: () => stateMgr.togglePause(),
    cleanup: () => {
      running = false;
      mouseInput.unbind();
      // Vide le canvas à la fin
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    },

  };
}
