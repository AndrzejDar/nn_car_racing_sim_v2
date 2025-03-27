import { Car } from "./car";
import { road } from "./main";
import { CAR_CONTROL_TYPE } from "./types";
import { randWholeNumInRange } from "./utils";

export const generateTraffic = (lanes: number) => {
  const distance = -150;
  const maxLength = -10000;
  let spawnProbability = 0.2;
  const probIncrement = 1 / (maxLength / distance) / 3;
  let traffic: Car[] = [];

  if (road) {
    traffic = [new Car(road.getLaneCenter(2), -200, 30, 50, CAR_CONTROL_TYPE.DUMMY, 2.5)];
  }
  for (let i = -350; i > maxLength; i += distance) {
    // console.log(i);
    const lineLayout = [];
    let count = 0;
    for (let l = 0; l < lanes; l++) {
      // console.log(Math.random());
      if (Math.random() < spawnProbability) {
        lineLayout.push(1);
        count += 1;
      } else {
        lineLayout.push(0);
        // console.log(l, i);
      }
    }

    if (count == lanes) {
      lineLayout[randWholeNumInRange(0, lanes - 1)] = 0;
    }
    // console.log(lineLayout);

    for (let l = 0; l < lanes; l++) {
      if (road && lineLayout[l] == 1) {
        traffic.push(new Car(road.getLaneCenter(l), i, 30, 50, CAR_CONTROL_TYPE.DUMMY, 2.5));
        spawnProbability += probIncrement;
      }
    }
  }
  return traffic;
};
