import { ChartContainer } from "@/components/ui/chart";
import { Car } from "./car";
import { DeathLine } from "./deathLine";
import { drawResultsChart, drawResultsChartv2, drawVisuals } from "./graph";
import { NeuralNetwork } from "./neuralNetwork";
import { Road } from "./road";
import { generateTraffic } from "./traffic";
import { CAR_CONTROL_TYPE } from "./types";
import { deepCopy, randWholeNumInRange } from "./utils";

const genSize = 1000;
const reproductionRate = 0.05;
const mutationChance = 0.5;

let canvas: null | HTMLCanvasElement = null;
let ctx: CanvasRenderingContext2D | null = null;
let graphCtx: CanvasRenderingContext2D | null = null;
let graphContainer: HTMLElement | null = null;
export let road: Road | null = null;
let cars: Car[] = [];
let traffic: Car[] = [];
let isSimulating = false;
let isBrainsSaved = false;
let reproductorsBrains = [];
let carsToReproduce = [];
let bestCar: Car | undefined;
let generation = 0;
let globalBiasAmount = 1;
let globalWeightAmount = 1;
let prevResults: number[] = [];
let simSpeed = 2; //draw evry nth frame
let frame = 1;
let lanes = 5;
let drawNth = 1;

let deathLine: DeathLine | null = null;

export function initialize() {
  canvas = document.getElementById("simulationCanvas") as HTMLCanvasElement;
  canvas.width = 270;
  ctx = canvas.getContext("2d");
  road = new Road(canvas.width / 2, canvas.width * 0.9, lanes);
  deathLine = new DeathLine(canvas.width, 4);
  traffic = generateTraffic(lanes);
  isBrainsSaved = false;

  //generates initial random cars
  cars = generateCars(genSize);
  // reproductors = [];

  if (carsToReproduce.length > 0) {
    // console.log(reproductorsBrains[0]);
    // console.log(reproductorsBrains[0].levels[0].biases[0].stringify());
    mutateCars(carsToReproduce);
  }

  // printPrevResuts();
  graphContainer = document.getElementById("visuals");
  const graphCanvas = document.getElementById("graph") as HTMLCanvasElement;
  if (graphCanvas && graphContainer) {
    // console.log(graphCanvas.clientWidth, graphCanvas.clientHeight);
    graphCanvas.width = Math.floor(graphContainer.clientWidth * 1);
    graphCanvas.height = Math.floor(graphContainer.clientHeight * 1);
    graphCtx = graphCanvas.getContext("2d");
  }

  drawResultsChartv2(prevResults);

  animate();
}

function save() {
  console.log("saving");
  // console.log(bestCar.brain);
  // console.log(bestCar);
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}
function remove() {
  localStorage.removeItem("bestBrain");
  localStorage.removeItem("bestBrains");
}

export function start() {
  isSimulating = true;
  animate();
}
export function stop() {
  isSimulating = false;
}
function kill() {
  const sortedCars = cars.sort((a, b) => {
    return a.y - b.y;
  });
  console.log(sortedCars);
  // reproductorsBrains = [];
  // for (let i = 0; i < genSize * reproductionRate; i++)
  //   reproductorsBrains.push(sortedCars[i].brain);

  // console.log(reproductorsBrains);

  for (let i = 0; i < cars.length; i++) {
    cars[i].damaged = true;
  }
}

function reset() {
  // console.log(bestCar);
  if (bestCar) prevResults.push(bestCar.y);
  stop();
  if (canvas) {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }
  initialize();
  setTimeout(() => start(), 100);
}

function generateCars(i: number) {
  const cars = new Array(i);
  for (let i = 0; i < genSize; i++) {
    if (road) {
      cars[i] = new Car(road?.getLaneCenter(2), 0, 30, 50, CAR_CONTROL_TYPE.AI);
    }
  }
  return cars;
}

function mutateCars(carsToReproduce: any[]) {
  // console.log(carsToReproduce);
  let fitnessSum = 0;
  for (let i = 0; i < carsToReproduce.length; i++) {
    fitnessSum += Math.floor(carsToReproduce[i].fitness);
  }

  for (let i = 0; i < cars.length; i++) {
    const reproductorA = carsToReproduce[i % carsToReproduce.length];
    cars[i].brain = deepCopy(reproductorA.brain);
    cars[i].sensor?.setBase(reproductorA.sensor.rayCount, reproductorA.sensor.rayLength, reproductorA.sensor.raySpreadDivider);
    let reproductorB: Car | null = null;
    if (i < carsToReproduce.length) {
      // retain best unchaged from prev run
      // carB = carA;
    } else {
      const selectedFitness = randWholeNumInRange(0, fitnessSum);
      let tmpFitnessSum = 0;
      for (let j = 0; j < carsToReproduce.length; j++) {
        tmpFitnessSum += carsToReproduce[j].fitness;
        if (selectedFitness <= tmpFitnessSum) {
          // console.log(tmpFitnessSum, carsToReproduce[j]);
          reproductorB = deepCopy(carsToReproduce[j]);
          break;
        }
      }
      if (!reproductorA || !reproductorB) {
        console.log("missingcar", reproductorA, reproductorB);
        reproductorB = carsToReproduce[0];
      }
      // console.log(reproductorA.brain, reproductorB.brain, reproductorB);
      // mutating car A with carB
      if (reproductorB?.brain) NeuralNetwork.geneticAlgo(reproductorA.brain, reproductorB.brain, 1, mutationChance, true);
      // cars[i].sensor.mutate(reproductorB.sensor, mutationChance / 100);
    }
  }
}

function animate() {
  //animate deathLine
  deathLine?.update();
  // animiate cars in traffic
  for (let i = 0; i < traffic.length; i++) {
    if (road) traffic[i]?.update(road.borders, []);
  }

  // fitnes func
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

  const alive = [];
  for (let i = 0; i < genSize; i++) {
    //kill struglers
    if (deathLine && cars[i].y > deathLine.y && !cars[i].damaged) {
      cars[i].damaged = true;
      cars[i].fitness = cars[i].y * -1;
    }
    // save as alive
    if (!cars[i].damaged) alive.push(i);

    // animtae ai cars
    if (road && cars[i].damaged == false) cars[i].update(road.borders, traffic);

    // sa
  }

  // count driving

  const counter = document.getElementById("counter");
  if (counter) {
    counter.innerText = alive.length.toString();
  }

  const genCounter = document.getElementById("genCounter");
  if (genCounter) {
    genCounter.innerText = `Gen: ${generation}`;
  }

  //save brains if reproductionRate is reached
  // if (alive.length < genSize * reproductionRate && isBrainsSaved == false) {
  //   console.log(alive.length);
  //   console.log(genSize * reproductionRate);
  //   if (alive.length != 0) reproductorsBrains = [];
  //   for (let i = 0; i < alive.length; i++) {
  //     reproductorsBrains.push(cars[alive[i]].brain);
  //   }

  //   console.log(
  //     "saved reproductors to variable",
  //     reproductorsBrains.length,
  //     reproductorsBrains
  //   );
  //   isBrainsSaved = true;
  // }

  // if (alive.length < (genSize * reproductionRate) / 2 && generation < 3) {
  //   //adjust globals
  //   generation++;
  //   reset();
  // }
  // if (alive.length < 1 && generation >= 3) {
  //   //adjust globals
  //   generation++;
  //   globalBiasAmount = globalBiasAmount * 0.9;
  //   globalWeightAmount = globalWeightAmount * 0.9;
  //   reset();
  // }
  if (alive.length < 1) {
    //adjust globals
    selectReproductors();
    generation++;
    globalBiasAmount = globalBiasAmount * 0.9;
    globalWeightAmount = globalWeightAmount * 0.9;
    // console.log("call reset");
    reset();
  }
  drawSim();
  // drawVisuals(bestCar.brain);

  if (isSimulating) requestAnimationFrame(animate);
  // drawGraph(bestCar.brain);
}

function drawSim() {
  if (canvas && ctx && road && deathLine && bestCar) {
    canvas.height = window.innerHeight;
    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height * 0.7);
    road.draw(ctx);
    deathLine.draw(ctx, "red");
    for (let i = 0; i < traffic.length; i++) {
      traffic[i].draw(ctx, "red");
    }
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < genSize; i++) {
      if (i < reproductorsBrains.length) {
        ctx.globalAlpha = 0.8;
        cars[i].draw(ctx, "green");
        ctx.globalAlpha = 0.05;
      }
      //draw only cars in view
      if (bestCar.y - cars[i].y > -400) cars[i].draw(ctx, "blue");
    }
    ctx.globalAlpha = 1;
    bestCar.draw(ctx, "blue", true);

    // cars[0].draw(ctx, "purple", false);

    ctx.restore();

    drawVisuals(graphCtx, graphContainer, bestCar.brain);
  }
}

function selectReproductors() {
  reproductorsBrains = [];
  carsToReproduce = [];
  const sortedCars = cars.sort((a, b) => {
    return b.fitness - a.fitness;
  });

  // carsToReproduce = sortedCars.slice(0, Math.floor(genSize * reproductionRate));

  for (let i = 0; i < genSize * reproductionRate; i++) {
    const brain = sortedCars[i].brain;
    const sensor = {
      rayCount: sortedCars[i].sensor?.rayCount,
      rayLength: sortedCars[i].sensor?.rayLength,
      raySpreadDivider: sortedCars[i].sensor?.raySpreadDivider,
    };
    const fitness = sortedCars[i].fitness;
    carsToReproduce.push({ brain: brain, sensor: sensor, fitness: fitness });
  }
}

function printPrevResuts() {
  let container = document.getElementById("results");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  for (let i = 0; i < prevResults.length; i++) {
    let result = document.createElement("span");
    result.innerText = `gen: ${i + 1}, result: ${-1 * prevResults[i].toFixed(2)}`;
    container.appendChild(result);
  }
}
