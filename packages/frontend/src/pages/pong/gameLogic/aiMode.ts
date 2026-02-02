import { CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED } from "../constants";
import { Ball } from "../gameObjects/ball";
import { Paddle } from "../gameObjects/paddle";

/**
 * Prédit approximativement la position Y où la balle touchera le côté droit (IA)
 */
export function predictBallY(
  ball: Ball,
  paddle2: Paddle
): number {
  // 1️⃣ Vérifier si la balle va vers la droite
  if (ball.dx <= 0) return CANVAS_HEIGHT / 2;

  // 2️⃣ Temps pour atteindre paddle2
  const distanceX: number = (paddle2.x - ball.radius) - ball.x;
  const time: number = distanceX / ball.dx;

  // 3️⃣ Position future Y en tenant compte des rebonds répétés
  let futureY: number = ball.y + ball.dy * time;

  // Gestion des rebonds multiples
  const height = CANVAS_HEIGHT;
  while (futureY < 0 || futureY > height) {
    if (futureY < 0) futureY = -futureY;
    if (futureY > height) futureY = 2 * height - futureY;
  }

  // 4️⃣ Ajouter une petite marge pour simuler une IA humaine plus la balle va vite moins l'ia est précise
  const errorFactor = Math.min(ball.speed / 10, 1);
  const margin = (Math.random() - 0.5) * PADDLE_HEIGHT * 0.5 * errorFactor;
  futureY += margin;

  // 5️⃣ Limiter la position de la balle à l’intérieur du canvas
  if (futureY < 0) futureY = 0;
  if (futureY > height - PADDLE_HEIGHT) futureY = height - PADDLE_HEIGHT;

  return futureY;
}


/**
 * Déplace le paddle2 vers targetY, simule un appui sur ↑ ou ↓
 */
export function movePaddleAI(paddle2: Paddle, targetY: number): void {
  const speedFactor = 0.5; // 50% de la vitesse max
  const speed = PADDLE_SPEED * speedFactor;

  const centerY = paddle2.y + PADDLE_HEIGHT / 2;
  const distance = targetY - centerY;

  if (Math.abs(distance) < speed) {
    paddle2.dy = distance; // pas dépasser la cible
  } else {
    paddle2.dy = distance > 0 ? speed : -speed;
  }
}

