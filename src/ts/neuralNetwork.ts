import { activation, randomDistribution } from "./utils";

export class NeuralNetwork {
  neuronCounts: number[];
  levels: Level[];

  constructor(neuronCounts: number[]) {
    this.neuronCounts = neuronCounts;
    this.levels = new Array(neuronCounts.length - 1);

    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels[i] = new Level(neuronCounts[i], neuronCounts[i + 1], neuronCounts.length - 2 == i ? true : false);
    }
    // console.log(this.levels);
  }

  static feedForward(givenInputs, network) {
    let outputs = givenInputs;
    //  network.levels[i].feedForward(givenInputs)

    for (let i = 0; i < network.levels.length; i++) {
      outputs = Level.feedForward(outputs, network.levels[i]);
      //   console.log(i, outputs);
    }
    // console.log(outputs);
    return outputs;
  }

  static mutate(network: NeuralNetwork, biasAmount = 0.1, weightAmount = 0.3) {
    // console.log("mutating network");
    if (!network) console.log("missing brain to mutate");
    // console.log(network);
    network.levels.forEach((level) => {
      if (!level.outputsBinary) {
        for (let i = 0; i < level.biases.length; i++) {
          level.biases[i] = level.biases[i] + randomDistribution() * biasAmount;
          if (level.biases[i] > 1) level.biases[i] = 1;
          if (level.biases[i] < -1) level.biases[i] = -1;
        }
      }
      //   console.log("level biases after", level.biases);

      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = level.weights[i][j] + randomDistribution() * weightAmount;
          if (level.weights[i][j] > 1) level.weights[i][j] = 1;
          if (level.weights[i][j] < -1) level.weights[i][j] = -1;
        }
        // if (i == 0) console.log("after", i, level.weights[i]);
      }
    });
  }

  static geneticAlgo(a: NeuralNetwork, b: NeuralNetwork, mutationRange = 1, mutationChance = 0.05, print: boolean) {
    if (print == true) {
      if (a.levels[a.levels.length - 1].biases === b.levels[b.levels.length - 1].biases) console.log("IDEWNTYCZNI RODZICE");
      // console.log(
      //   a.levels[a.levels.length - 1].weights[0],
      //   b.levels[b.levels.length - 1].weights[0]
      // );
    }
    a.levels.forEach((level, id) => {
      for (let i = 0; i < level.biases.length; i++) {
        // if (print == true) console.log(randWholeNumInRange(0, 1));
        if (Math.random() < 0.5) {
          //take from second parent
          // level.biases[i] = 0;
          level.biases[i] = b.levels[id].biases[i];
        }
        if (Math.random() < mutationChance) {
          //straight random variant
          // level.biases[i] = Math.random() * 2 - 1;
          //random dist variant
          level.biases[i] = Math.max(-1, Math.min(1, level.biases[i] + randomDistribution() * mutationRange));
        }
      }

      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          if (Math.random() < 0.5) {
            //take from second parent
            level.weights[i][j] = b.levels[id].weights[i][j];
          }
          //random mutation
          if (Math.random() < mutationChance) {
            //straight random variant
            // level.weights[i][j] = Math.random() * 2 - 1;
            //random dist variant
            level.weights[i][j] = Math.max(-1, Math.min(1, level.weights[i][j] + randomDistribution() * mutationRange));
          }
        }
      }
    });
  }
}

class Level {
  inputsCount: number;
  outputsCount: number;
  biases: number[];
  weights: number[][];
  outputsBinary: boolean;

  constructor(inputsCount: number, outputsCount: number, outputsBinary = false) {
    this.inputsCount = inputsCount;
    this.outputsCount = outputsCount;
    this.biases = new Array(outputsCount);
    this.weights = [];
    for (let i = 0; i < this.outputsCount; i++) {
      this.weights.push(new Array(inputsCount));
    }
    this.outputsBinary = outputsBinary;

    Level.#randomize(this);
  }

  static #randomize(level: Level) {
    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = randomDistribution(); //Math.random() * 2 - 1;
    }
    for (let i = 0; i < level.outputsCount; i++) {
      for (let j = 0; j < level.inputsCount; j++) {
        level.weights[i][j] = randomDistribution(); //Math.random() * 2 - 1;
      }
    }
  }

  static feedForward(inputValues: number[], level: Level) {
    // console.log(inputValues);
    const outputValues = new Array(level.outputsCount);
    for (let i = 0; i < level.outputsCount; i++) {
      let value = 0;
      for (let j = 0; j < level.inputsCount; j++) {
        // console.log(inputValues[j], level.weights[i][j]);
        value += inputValues[j] * level.weights[i][j];
      }
      //   console.log(value);
      outputValues[i] = activation((value + level.biases[i]) / inputValues.length);
      if (level.outputsBinary) outputValues[i] = outputValues[i] >= 0 ? 1 : 0;
    }
    // console.log(outputValues);
    return outputValues;
  }
}
