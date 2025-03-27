const generateTraffic = (lanes) => {
  const distance = -150;
  const maxLength = -10000;
  let spawnProbability = 0.2;
  const probIncrement = 1 / (maxLength / distance) / 3;

  const traffic = [new Car(road.getLaneCenter(2), -200, 30, 50, "DUMMY", 2.5)];
  for (let i = -350; i > maxLength; i += distance) {
    // console.log(i);
    let lineLayout = [];
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
      if (lineLayout[l] == 1) {
        traffic.push(new Car(road.getLaneCenter(l), i, 30, 50, "DUMMY", 2.5));
        spawnProbability += probIncrement;
      }
    }
  }
  return traffic;
};
