export class DeathLine {
  speed: number;
  y: number;
  l: number;
  r: number;

  constructor(width: number, speed: number) {
    this.speed = speed;
    this.y = 400;
    this.l = 0;
    this.r = width;
  }

  draw(ctx: CanvasRenderingContext2D, color = "red") {
    ctx.fillStyle = color;
    ctx.beginPath();
    // console.log(this.polygon);
    ctx.moveTo(this.l, this.y);
    ctx.lineTo(this.r, this.y);
    ctx.fill();
  }

  update() {
    this.y -= this.speed;
  }
}
