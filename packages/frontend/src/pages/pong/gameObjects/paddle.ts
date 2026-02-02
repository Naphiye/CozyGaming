import { CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED, PADDLE_WIDTH } from "../constants";

export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dy: number;

  constructor(
    x: number,
    y: number,
    dy: number = 0
  ) {
    this.x = x;
    this.y = y;
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.speed = PADDLE_SPEED;
    this.dy = dy;
  }

  update(deltaTime: number) {
    this.y += this.dy * deltaTime;

    // rester dans le canvas
    if (this.y < 0) this.y = 0;
    if (this.y + PADDLE_HEIGHT > CANVAS_HEIGHT)
      this.y = CANVAS_HEIGHT - PADDLE_HEIGHT;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const radius = 5; // rayon des coins arrondis
    ctx.fillStyle = "#C16765";

    ctx.beginPath();
    ctx.roundRect(this.x, this.y, PADDLE_WIDTH, PADDLE_HEIGHT, radius);
    ctx.fill();
  }


  // 🔄 Remet le paddle au centre 
  reset() {
    this.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
  }
}
