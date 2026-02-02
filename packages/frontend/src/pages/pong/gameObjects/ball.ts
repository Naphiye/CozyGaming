import { BALL_ACCELERATION_FACTOR, BALL_RADIUS, BALL_SPEED, CANVAS_HEIGHT, CANVAS_WIDTH, MAX_BOUNCE_ANGLE, PADDLE_HEIGHT, PADDLE_WIDTH } from "../constants";
import { Paddle } from "./paddle";

export class Ball {
  x: number;
  y: number;
  dx: number; // vitesse horizontale
  dy: number; // vitesse verticale
  radius: number;
  speed: number; // vitesse actuelle
  constructor(
  ) {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.radius = BALL_RADIUS;
    this.speed = BALL_SPEED;

    // on choisit une direction aléatoire pour commencer
    const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8; // entre -22° et 22°
    const dir = Math.random() > 0.5 ? 1 : -1; // gauche ou droite

    this.dx = Math.cos(angle) * this.speed * dir;
    this.dy = Math.sin(angle) * this.speed;
  }

  // 🔄 Mise à jour de la balle à chaque frame
  update(
    paddle1: Paddle,
    paddle2: Paddle,
    handleScore: (player: "left" | "right") => void,
    deltaTime: number
  ) {
    this.move(deltaTime);
    this.handleWallCollision();
    this.handlePaddleCollision(paddle1, 1);
    this.handlePaddleCollision(paddle2, 2);
    this.checkScore(handleScore);
  }

  // ⏩ Déplace la balle en fonction du temps écoulé
  private move(deltaTime: number) {
    this.x += this.dx * deltaTime;
    this.y += this.dy * deltaTime;
  }

  // 🧱 Collision avec le haut et le bas du canvas
  private handleWallCollision() {
    if (this.y - BALL_RADIUS < 0) {
      this.y++;
      this.dy *= -1;
    }
    if (this.y + BALL_RADIUS > CANVAS_HEIGHT) {
      this.y--;
      this.dy *= -1;
    }
  }

  // 🏓 Gestion de la collision avec un paddle
  private handlePaddleCollision(paddle: Paddle, player: 1 | 2) {
    // Vérifie si la balle est alignée verticalement avec le paddle
    if (this.y > paddle.y && this.y < paddle.y + PADDLE_HEIGHT) {
      // Collision avec le paddle du joueur 1
      if (player === 1 && this.x - BALL_RADIUS < paddle.x + PADDLE_WIDTH) {
        this.bounceFromPaddle(paddle, 1);
      }
      // Collision avec le paddle du joueur 2
      if (player === 2 && this.x + BALL_RADIUS > paddle.x) {
        this.bounceFromPaddle(paddle, 2);
      }
    }
  }

  // 🔄 Calcul du rebond de la balle selon l'endroit où elle touche le paddle
  private bounceFromPaddle(paddle: Paddle, player: 1 | 2) {
    // Calcul de la position relative de la balle sur le paddle (-1 = haut, 0 = centre, 1 = bas)
    const relativeIntersectY =
      (this.y - (paddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);

    // Calcul de l'angle de rebond maximal (ici 45° = π/4)
    const bounceAngle = relativeIntersectY * (MAX_BOUNCE_ANGLE);

    // Mise à jour de dx/dy selon le côté du joueur et l'angle calculé
    this.dx = (player === 1 ? 1 : -1) * Math.cos(bounceAngle) * this.speed;
    this.dy = Math.sin(bounceAngle) * this.speed;

    // Correction de la position pour éviter que la balle reste "coincée" dans le paddle
    if (player === 1) {
      this.x = paddle.x + PADDLE_WIDTH + BALL_RADIUS;
    } else {
      this.x = paddle.x - BALL_RADIUS;
    }

    // ⚡ Augmente la vitesse après chaque collision avec un paddle
    this.accelerate();
  }

  // 🏆 Vérifie si un joueur marque un point
  private checkScore(
    handleScore: (player: "left" | "right") => void
  ) {
    if (this.x - BALL_RADIUS < 0) {
      handleScore("right");
      this.reset();
    }
    if (this.x + BALL_RADIUS > CANVAS_WIDTH) {
      handleScore("left");
      this.reset();
    }
  }
  // ⚡ Augmente la vitesse de la balle après chaque collision
  accelerate() {
    // +5% de vitesse
    this.speed *= BALL_ACCELERATION_FACTOR;

    // On recalcule dx/dy pour garder la même direction mais plus rapide
    const direction = Math.atan2(this.dy, this.dx);
    this.dx = Math.cos(direction) * this.speed;
    this.dy = Math.sin(direction) * this.speed;
  }

  // 🔄 Remet la balle au centre avec vitesse initiale
  reset() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;

    // on réinitialise la vitesse
    this.speed = BALL_SPEED;

    // nouvelle direction aléatoire
    const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8; // entre -22° et 22°
    const dir = Math.random() > 0.5 ? 1 : -1; // gauche ou droite

    this.dx = Math.cos(angle) * this.speed * dir;
    this.dy = Math.sin(angle) * this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Chaque forme dessinée doit commencer par beginPath() pour éviter de fusionner avec d'autres formes déjà tracées.
    ctx.beginPath();

    // 🌀 Trace un cercle (la balle)
    // ball.x, ball.y = coordonnées du centre du cercle
    // ball.radius = rayon du cercle
    // 0 = angle de départ (en radians)
    // Math.PI * 2 = angle de fin (un cercle complet = 2π radians)
    ctx.arc(this.x, this.y, BALL_RADIUS, 0, Math.PI * 2);

    // 🎨 Définir la couleur de remplissage pour le cercle
    ctx.fillStyle = "#C16765"; // couleur de ball

    // 🖌 Remplit le chemin actuel avec la couleur définie
    // Comme le chemin est un cercle, ça va remplir l’intérieur de la balle
    ctx.fill();

    // 🔒 Ferme le chemin actuel
    // Relie le dernier point au premier (utile surtout pour des polygones)
    // Pour un cercle, ce n’est pas strictement nécessaire, mais c’est une bonne pratique
    ctx.closePath();
  }
}
