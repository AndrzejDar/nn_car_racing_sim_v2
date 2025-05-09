import { Car } from "./car";
import { Line, Touch } from "./types";
import { getIntersection, lerp, randWholeNumInRange } from "./utils";

export class Sensor {
  car: Car;
  rayCount: number;
  rayLength: number;
  raySpreadDivider: number;
  raySpread: number;
  rays: Line[];
  readings: (Touch | null)[];

  constructor(car: Car) {
    this.car = car;
    this.rayCount = 14; //randWholeNumInRange(10, 20); //14
    this.rayLength = 300; //randWholeNumInRange(200, 300); //300
    this.raySpreadDivider = 1.5; //range(1-4 with 0.1 incremetns, 1.5
    this.raySpread = (Math.PI * 2) / this.raySpreadDivider; //range(1-10 with 0.1 incremetns, 1.5

    this.rays = [];
    this.readings = [];
  }

  update(roadBorders: Line[], traffic: Car[]) {
    this.#castRays();
    this.readings = [];
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic));
    }
  }

  setBase(base: setBaseModel) {
    // setBase(rayCount: number, rayLength: number, raySpreadDivider: number, raySpread: number) {
    this.rayCount = base.rayCount;
    this.rayLength = base.rayLength;
    this.raySpreadDivider = base.raySpreadDivider;
    this.raySpread = base.raySpread;
  }

  // mutate(other: Sensor, mutationChance = 0.05) {
  //   if (randWholeNumInRange(0, 1) == 1) this.rayCount = other.rayCount;
  //   if (randWholeNumInRange(0, 1) == 1) this.rayLength = other.rayLength;
  //   if (randWholeNumInRange(0, 1) == 1) this.raySpreadDivider = other.raySpreadDivider;

  //   //Random mutation
  //   if (Math.random() < mutationChance) {
  //     if (randWholeNumInRange(0, 1) == 1) this.rayCount++;
  //     else this.rayCount = Math.max(1, this.rayCount - 1);
  //   }
  //   if (Math.random() < mutationChance) {
  //     if (randWholeNumInRange(0, 1) == 1) this.rayLength += 10;
  //     else this.rayLength -= 10;
  //   }
  //   if (Math.random() < mutationChance) {
  //     if (randWholeNumInRange(0, 1) == 1) this.raySpreadDivider = Math.min(this.raySpreadDivider + 0.1, 8);
  //     else this.raySpreadDivider = Math.max(this.raySpreadDivider - 0.1, 1);
  //   }

  //   this.raySpread = (Math.PI * 2) / this.raySpreadDivider;
  // }

  static geneticMutation(parentA: Sensor, parentB: Sensor, mutationChance: number = 0.05): setBaseModel {
    let rayCount = parentA.rayCount;
    let rayLength = parentA.rayLength;
    let raySpreadDivider = parentA.raySpreadDivider;
    if (randWholeNumInRange(0, 1) == 1) rayCount = parentB.rayCount;
    if (randWholeNumInRange(0, 1) == 1) rayLength = parentB.rayLength;
    if (randWholeNumInRange(0, 1) == 1) raySpreadDivider = parentB.raySpreadDivider;

    //Random mutation
    if (Math.random() < mutationChance) {
      if (randWholeNumInRange(0, 1) == 1) rayCount++;
      else rayCount = Math.max(1, rayCount - 1);
    }
    if (Math.random() < mutationChance) {
      if (randWholeNumInRange(0, 1) == 1) rayLength += 10;
      else rayLength -= 10;
    }
    if (Math.random() < mutationChance) {
      if (randWholeNumInRange(0, 1) == 1) raySpreadDivider = Math.min(raySpreadDivider + 0.1, 8);
      else raySpreadDivider = Math.max(raySpreadDivider - 0.1, 1);
    }

    const raySpread = (Math.PI * 2) / raySpreadDivider;

    return { rayCount, rayLength, raySpreadDivider, raySpread };
  }

  #getReading(ray: Line, roadBorders: Line[], traffic: Car[]): Touch | null {
    const touches: Touch[] = [];
    for (let i = 0; i < roadBorders.length; i++) {
      const touch = getIntersection(ray[0], ray[1], roadBorders[i][0], roadBorders[i][1]);
      if (touch) touches.push(touch);
    }
    // #1 forEach slower than #2 by 33%
    // traffic.forEach((car) => {
    //   const poly = car.polygon;
    //   poly.forEach((point, j) => {
    //     const nextPoint = poly[(j + 1) % poly.length];
    //     const value = getIntersection(ray[0], ray[1], point, nextPoint);
    //     if (value) touches.push(value);
    //   });
    // });

    // #2 for loop fastest so far 120 ms for 700 cars
    for (let i = 0; i < traffic.length; i++) {
      // console.log(ray[0], ray[1], traffic[i]);

      // cut out checks for far away objects down by 60%(to 40ms) for 700
      if (traffic[i].y - ray[0].y < -this.rayLength * 1.2) continue;
      if (traffic[i].y - ray[0].y > this.rayLength * 1.2) continue;

      const poly = traffic[i].polygon;
      for (let j = 0; j < poly.length; j++) {
        const value = getIntersection(ray[0], ray[1], poly[j], poly[(j + 1) % poly.length]);
        if (value) touches.push(value);
      }
    }

    if (touches.length == 0) {
      return null;
    } else {
      const offsets = touches.map((e) => e.offset);
      const minOffset = Math.min(...offsets);

      return touches.find((e) => e.offset == minOffset) ?? null;
    }
  }

  #castRays() {
    // console.log("in ray upd");
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle = lerp(this.raySpread / 2, -this.raySpread / 2, i / (this.rayCount - 1)) + this.car.angle;

      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };

      this.rays.push([start, end]);
      //   console.log(this.rays);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // console.log(this.rays);
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1];
      if (this.readings[i] !== null && this.readings[i]) end = this.readings[i] as Touch;

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(end.x, end.y, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "black";
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.stroke();
    }
  }
}

export interface setBaseModel {
  rayCount: number;
  rayLength: number;
  raySpreadDivider: number;
  raySpread: number;
}
