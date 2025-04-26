import { Controls } from "./controls";
import { road } from "./main";
import { NeuralNetwork } from "./neuralNetwork";
import { Sensor } from "./sensor";
import { Line, CAR_CONTROL_TYPE } from "./types";
import { polysIntersect } from "./utils";

export class Car {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  acceleration: number;
  maxSpeed: number;
  friction: number;
  angle: number;
  damaged: boolean;
  controlType: CAR_CONTROL_TYPE;
  fitness: number;
  sprite: HTMLImageElement;
  sensor?: Sensor;
  brain?: NeuralNetwork;
  controls: Controls;
  polygon: {
    x: number;
    y: number;
  }[];

  constructor(x: number, y: number, width: number, height: number, controlType: CAR_CONTROL_TYPE, maxSpeed = 4) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.sprite = new Image();

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.02;
    this.angle = 0;
    this.damaged = false;
    this.controlType = controlType;
    this.fitness = 0;

    this.polygon = [];

    if (controlType === CAR_CONTROL_TYPE.AI) {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 20, 20, 4]);
      this.sprite.src = "./assets/racer.png";
    }
    if (controlType == CAR_CONTROL_TYPE.DUMMY) {
      this.sprite.src = "./assets/obstacle.png";
    }

    this.controls = new Controls(controlType);
  }

  update(roadBorders: Line[], traffic: Car[]) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assesDamage(roadBorders, traffic);
      if (this.damaged == true) this.fitness = this.y * -1;
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
    }
    if (this.brain) {
      //   console.log(this.sensor.readings);
      const outputs = NeuralNetwork.feedForward(
        this.sensor?.readings.map((reading) => {
          return reading?.offset ? 1 - reading.offset : 0;
        }),
        this.brain
      );
      //   console.log(outputs);
      this.controls.forward = outputs[0];
      this.controls.reverse = outputs[1];
      this.controls.left = outputs[2];
      this.controls.right = outputs[3];
    }
  }

  #assesDamage(roadBorders: Line[], traffic: Car[]) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) return true;
    }

    for (let i = 0; i < traffic.length; i++) {
      // cut out checks for far away objects down by 60%(to 16ms) for 700
      if (traffic[i].y - this.y > -50 && traffic[i].y - this.y < 50) {
        if (polysIntersect(this.polygon, traffic[i].polygon)) return true;
      }
    }
    return false;
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });
    return points;
  }

  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }
    if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
    if (this.speed < -this.maxSpeed / 3) this.speed = -this.maxSpeed / 3;

    if (this.speed > 0) this.speed -= this.friction;
    if (this.speed < 0) this.speed += this.friction;
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;

      if (this.controls.left) {
        this.angle += 0.04 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.04 * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  draw(ctx: CanvasRenderingContext2D, color: string, drawSensors = false) {
    ctx.save();
    if (this.damaged) {
      ctx.fillStyle = "gray";
      ctx.beginPath();
      ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
      for (let i = 1; i < this.polygon.length; i++) {
        ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
      }
      ctx.fill();
    } else ctx.fillStyle = color;

    ctx.translate(this.x, this.y);
    ctx.rotate(-this.angle);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
    if (this.sensor && drawSensors) {
      this.sensor.draw(ctx);
    }
  }

  static createAiOffspring(parentA: Car, parentB: Car) {
    if (road === null) {
      console.log("road not found");
      return;
    }

    const offspring = new Car(road.getLaneCenter(2), 0, 30, 50, CAR_CONTROL_TYPE.AI);
    if (!parentA.sensor || !parentB.sensor) {
      console.log("parent missing sensor");
      return;
    }
    const newSensorParms = Sensor.geneticMutation(parentA.sensor, parentB.sensor);
    if (Array.isArray(newSensorParms)) {
      offspring.sensor?.setBase(newSensorParms);
    }
    return offspring;
  }
}
