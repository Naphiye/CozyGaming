import { BallState, PaddleState, BallUpdateResult } from "./types.js";
import { BALL_ACCELERATION_FACTOR, BALL_RADIUS, BALL_SPEED, CANVAS_HEIGHT, CANVAS_WIDTH, MAX_BOUNCE_ANGLE, PADDLE_HEIGHT, PADDLE_WIDTH } from "./constants.js";

export function updateBall(
    ball: BallState,
    paddle1: PaddleState,
    paddle2: PaddleState,
    deltaTime: number
): BallUpdateResult {
    move(deltaTime, ball);
    handleWallCollision(ball);
    handlePaddleCollision(ball, paddle1, 1);
    handlePaddleCollision(ball, paddle2, 2);
    const scored = checkScore(ball);
    return { ball, scored };
}

function move(deltaTime: number, ball: BallState) {
    ball.x += ball.dx * deltaTime;
    ball.y += ball.dy * deltaTime;
}


function handleWallCollision(ball: BallState) {
    if (ball.y - BALL_RADIUS < 0) {
        ball.y++;
        ball.dy *= -1;
    }
    if (ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
        ball.y--;
        ball.dy *= -1;
    }
}


function handlePaddleCollision(ball: BallState, paddle: PaddleState, player: 1 | 2) {
    // Vérifie si la balle est alignée verticalement avec le paddle
    if (ball.y > paddle.y && ball.y < paddle.y + PADDLE_HEIGHT) {
        // Collision avec le paddle du joueur 1
        if (player === 1 && ball.x - BALL_RADIUS < paddle.x + PADDLE_WIDTH) {
            bounceFromPaddle(ball, paddle, 1);
        }
        // Collision avec le paddle du joueur 2
        if (player === 2 && ball.x + BALL_RADIUS > paddle.x) {
            bounceFromPaddle(ball, paddle, 2);
        }
    }
}

function bounceFromPaddle(ball: BallState, paddle: PaddleState, player: 1 | 2) {
    // Calcul de la position relative de la balle sur le paddle (-1 = haut, 0 = centre, 1 = bas)
    const relativeIntersectY =
        (ball.y - (paddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);

    // Calcul de l'angle de rebond maximal (ici 45° = π/4)
    const bounceAngle = relativeIntersectY * (MAX_BOUNCE_ANGLE);

    // Mise à jour de dx/dy selon le côté du joueur et l'angle calculé
    ball.dx = (player === 1 ? 1 : -1) * Math.cos(bounceAngle) * ball.speed;
    ball.dy = Math.sin(bounceAngle) * ball.speed;

    // Correction de la position pour éviter que la balle reste "coincée" dans le paddle
    if (player === 1) {
        ball.x = paddle.x + PADDLE_WIDTH + BALL_RADIUS;
    } else {
        ball.x = paddle.x - BALL_RADIUS;
    }

    accelerate(ball);
}

function accelerate(ball: BallState) {
    // +5% de vitesse
    ball.speed *= BALL_ACCELERATION_FACTOR;

    // On recalcule dx/dy pour garder la même direction mais plus rapide
    const direction = Math.atan2(ball.dy, ball.dx);
    ball.dx = Math.cos(direction) * ball.speed;
    ball.dy = Math.sin(direction) * ball.speed;
}


function checkScore(
    ball: BallState,
): "left" | "right" | null {
    if (ball.x - BALL_RADIUS < 0) {
        reset(ball);
        return "right";
    }
    if (ball.x + BALL_RADIUS > CANVAS_WIDTH) {
        reset(ball);
        return "left";
    }
    return null;
}

function reset(ball: BallState) {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;

    // on réinitialise la vitesse
    ball.speed = BALL_SPEED;

    // nouvelle direction aléatoire
    const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8; // entre -22° et 22°
    const dir = Math.random() > 0.5 ? 1 : -1; // gauche ou droite

    ball.dx = Math.cos(angle) * ball.speed * dir;
    ball.dy = Math.sin(angle) * ball.speed;
}