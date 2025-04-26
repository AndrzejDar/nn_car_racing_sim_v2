import { NeuralNetwork } from "./neuralNetwork";

export const drawVisuals = (graphCtx: CanvasRenderingContext2D | null, container: HTMLElement | null, brain?: NeuralNetwork) => {
  if (!graphCtx) {
    console.log("no graphCtx");
    return;
  }
  if (!container) {
    console.log("no container");
    return;
  }
  if (!brain) {
    console.log("no brain");
    return;
  }
  drawGraph(graphCtx, container, brain);
};

export const drawResultsChart = (results: number[]) => {
  //   console.log(results);
  const chartCanvas = document.getElementById("chart") as HTMLCanvasElement;
  chartCanvas.width = chartCanvas.clientWidth;
  chartCanvas.height = chartCanvas.clientHeight;

  const chartCtx = chartCanvas.getContext("2d");
  if (chartCtx) {
    chartCtx.beginPath();
    chartCtx.moveTo(0, chartCanvas.clientHeight);
    let maxVal = results[0];
    results.forEach((res) => {
      if (maxVal > res) maxVal = res;
    });
    results.forEach((result, x) => {
      chartCtx.lineTo(((x + 1) * chartCanvas.clientWidth) / results.length, chartCanvas.clientHeight - (chartCanvas.clientHeight * result) / maxVal);
    });

    chartCtx.strokeStyle = "black";
    chartCtx.lineWidth = 2;
    chartCtx.stroke();
    chartCtx.restore();
    chartCtx.fillText((maxVal ? maxVal * -1 : 0).toFixed(0), 10, 20);
  }
};

export const drawResultsChartv2 = (results: number[]) => {
  const chartCanvas = document.getElementById("chart") as HTMLCanvasElement;
  if (!chartCanvas) {
    console.error("Chart canvas element not found");
    return;
  }
  chartCanvas.width = chartCanvas.clientWidth;
  chartCanvas.height = chartCanvas.clientHeight;
  const chartCtx = chartCanvas.getContext("2d");
  if (!chartCtx) {
    console.error("Failed to get 2D context for chart canvas");
    return;
  }

  // --- 1. Resize for HiDPI & Get Dimensions (in CSS Pixels) ---

  const canvasWidth = chartCanvas.clientWidth; // Use CSS pixels for layout
  const canvasHeight = chartCanvas.clientHeight;

  // --- Clear Canvas (respecting potential HiDPI scaling) ---
  chartCtx.save();
  chartCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to clear properly
  chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height); // Clear using buffer size
  chartCtx.restore(); // Restore potentially scaled state

  // --- Handle No Data ---
  if (!results || results.length === 0) {
    chartCtx.fillStyle = "grey";
    chartCtx.textAlign = "center";
    chartCtx.textBaseline = "middle";
    chartCtx.font = "14px Arial";
    chartCtx.fillText("No results data to display", canvasWidth / 2, canvasHeight / 2);
    return;
  }

  // --- 2. Define Margins & Plot Area ---
  const marginTop = 30;
  const marginBottom = 50;
  const marginLeft = 60;
  const marginRight = 20;
  const plotWidth = canvasWidth - marginLeft - marginRight;
  const plotHeight = canvasHeight - marginTop - marginBottom;

  if (plotWidth <= 0 || plotHeight <= 0) {
    console.error("Chart plot area has zero or negative dimensions. Check container/canvas CSS size and margins.");
    return; // Avoid drawing if plot area is invalid
  }

  // --- 3. Find Data Range (Min/Max Score) ---
  let minScore = results[0];
  let maxScore = results[0];
  results.forEach((res) => {
    if (res < minScore) minScore = res;
    if (res > maxScore) maxScore = res;
  });

  // Add a little padding to the range, especially if min/max are the same
  const scoreRange = maxScore - minScore;
  const rangePadding = scoreRange === 0 ? 1 : scoreRange * 0.1;
  const effectiveMinScore = minScore - rangePadding / 2;
  const effectiveMaxScore = maxScore + rangePadding / 2;
  const effectiveScoreRange = effectiveMaxScore - effectiveMinScore;

  if (effectiveScoreRange === 0) {
    minScore -= 1;
    maxScore += 1;
  }
  const finalMinScore = scoreRange === 0 ? minScore : effectiveMinScore;
  const finalMaxScore = scoreRange === 0 ? maxScore : effectiveMaxScore;
  const finalScoreRange = finalMaxScore - finalMinScore;

  // --- Helper Function to map data points to canvas coordinates ---
  const getCoords = (generationIndex: number, score: number): { x: number; y: number } => {
    const x = marginLeft + (generationIndex / Math.max(1, results.length - 1)) * plotWidth;

    const yRatio = finalScoreRange === 0 ? 0.5 : (score - finalMinScore) / finalScoreRange;
    const y = marginTop + plotHeight - yRatio * plotHeight;
    return { x, y };
  };

  // --- 4. Draw Axes Lines ---
  chartCtx.strokeStyle = "black";
  chartCtx.lineWidth = 1;
  chartCtx.beginPath();
  // Y Axis Line
  chartCtx.moveTo(marginLeft, marginTop);
  chartCtx.lineTo(marginLeft, marginTop + plotHeight);
  // X Axis Line
  chartCtx.moveTo(marginLeft, marginTop + plotHeight);
  chartCtx.lineTo(marginLeft + plotWidth, marginTop + plotHeight);
  chartCtx.stroke();

  // --- 5. Draw Y-Axis Ticks and Labels ---
  chartCtx.fillStyle = "black";
  chartCtx.textAlign = "right";
  chartCtx.textBaseline = "middle";
  chartCtx.font = "10px Arial";
  const numYTicks = 5;
  for (let i = 0; i <= numYTicks; i++) {
    const tickValue = finalMinScore + (i / numYTicks) * finalScoreRange;
    const tickY = marginTop + plotHeight - (i / numYTicks) * plotHeight;

    chartCtx.beginPath();
    chartCtx.moveTo(marginLeft - 5, tickY);
    chartCtx.lineTo(marginLeft, tickY);
    chartCtx.stroke();

    chartCtx.fillText(tickValue.toFixed(1), marginLeft - 8, tickY);
  }

  // --- 6. Draw X-Axis Ticks and Labels ---
  chartCtx.textAlign = "center";
  chartCtx.textBaseline = "top";
  const numXTicks = Math.min(10, results.length);
  const xTickIncrement = results.length > 1 ? (results.length - 1) / Math.max(1, numXTicks - 1) : 1;

  for (let i = 0; i < numXTicks; i++) {
    let genIndex = 0;
    if (results.length > 1) {
      genIndex = i === numXTicks - 1 ? results.length - 1 : Math.round(i * xTickIncrement);
    } else {
      genIndex = 0;
    }

    const tickX = marginLeft + (genIndex / Math.max(1, results.length - 1)) * plotWidth;
    const tickY = marginTop + plotHeight;

    chartCtx.beginPath();
    chartCtx.moveTo(tickX, tickY);
    chartCtx.lineTo(tickX, tickY + 5);
    chartCtx.stroke();
    chartCtx.fillText(genIndex.toString(), tickX, tickY + 8);
  }

  // --- 7. Draw Axis Titles ---
  chartCtx.textAlign = "center";
  chartCtx.textBaseline = "middle";
  chartCtx.font = "12px Arial";
  chartCtx.save();
  chartCtx.translate(marginLeft / 2 - 10, marginTop + plotHeight / 2);
  chartCtx.rotate(-Math.PI / 2);
  chartCtx.fillText("Score", 0, 0);
  chartCtx.restore();
  chartCtx.fillText("Generation", marginLeft + plotWidth / 2, canvasHeight - marginBottom / 2 + 10);

  // --- 8. Plot the Results Line ---
  chartCtx.strokeStyle = "blue";
  chartCtx.lineWidth = 2;
  chartCtx.beginPath();
  results.forEach((result, index) => {
    const { x, y } = getCoords(index, result);
    if (index === 0) {
      chartCtx.moveTo(x, y);
    } else {
      chartCtx.lineTo(x, y);
    }
  });
  chartCtx.stroke();
};

const drawGraph = (graphCtx: CanvasRenderingContext2D, container: HTMLElement, brain: NeuralNetwork) => {
  //   console.log(brain);
  // console.log(graphCtx.canvas.clientWidth, graphCtx.canvas.clientHeight);

  const colWidth = container.clientWidth / (brain.levels.length * 3 + 1);
  const graphCanvas = document.getElementById("graph") as HTMLCanvasElement;
  graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
  drawLevels(brain, colWidth, graphCtx);
};

const drawLevels = (brain: NeuralNetwork, colWidth: number, graphCtx: CanvasRenderingContext2D) => {
  //draw inputs
  // console.log(graphCtx.canvas);
  for (let i = 0; i < brain.levels.length; i++) {
    brain.levels[i].biases.forEach((node, j) => {
      brain.levels[i].weights[j].forEach((weight, prevId) => {
        drawConnection(
          colWidth,
          Math.min(colWidth, graphCtx.canvas.clientHeight / brain.levels[i].biases.length),
          i + 1,
          j,
          prevId,
          brain.levels[i - 1] ? Math.min(colWidth, graphCtx.canvas.clientHeight / brain.levels[i - 1].biases.length) : Math.min(colWidth, graphCtx.canvas.clientHeight / brain.levels[i].weights[0].length),
          weight,
          graphCtx
        );
      });
    });
  }

  //input nodes
  brain.levels[0].weights[0].forEach((node, rowId) => {
    drawNode(node, colWidth, Math.min(colWidth, graphCtx.canvas.clientHeight / brain.levels[0].weights[0].length), 0, rowId, graphCtx);
  });

  for (let i = 0; i < brain.levels.length; i++) {
    brain.levels[i].biases.forEach((node, j) => {
      drawNode(node, colWidth, Math.min(colWidth, graphCtx.canvas.clientHeight / brain.levels[i].biases.length), i + 1, j, graphCtx);
    });
  }
};

const drawNode = (node: number, colWidth: number, radius: number, colId: number, rowId: number, graphCtx: CanvasRenderingContext2D) => {
  //   console.log(ctx);
  //   ctx.beginPath();
  //   ctx.moveTo(50, 50);
  //   ctx.lineTo(-100, -100);
  //   ctx.strokeStyle = "yellow";
  //   ctx.lineWidth = 2;
  //   ctx.stroke();
  //   ctx.moveTo(size / 2 + size * colId, size / 2 + size * rowId);
  graphCtx.beginPath();
  graphCtx.arc(colWidth / 2 + colId * colWidth * 3, radius / 2 + radius * rowId, radius / 2 / 10, 0, Math.PI * 2);
  graphCtx.strokeStyle = "red";
  graphCtx.lineWidth = (node + 1) * 10;
  graphCtx.stroke();
  graphCtx.fillStyle = "white";
  graphCtx.fill();
  graphCtx.restore();

  //   ctx.beginPath();
  //   ctx.lineWidth = 1;
  //   ctx.strokeStyle = "black";
  //   ctx.moveTo(end.x, end.y);
  //   ctx.lineTo(this.rays[i][1].x, this.rays[i][1].y);
  //   ctx.stroke();
};

const drawConnection = (colWidth: number, radius: number, colId: number, rowId: number, prevId: number, prevRadius: number, weight: number, graphCtx: CanvasRenderingContext2D) => {
  graphCtx.beginPath();
  graphCtx.moveTo(colWidth / 2 + colWidth * colId * 3, radius / 2 + radius * rowId);
  graphCtx.lineTo(colWidth / 2 + colWidth * (colId - 1) * 3, prevRadius / 2 + prevRadius * prevId);
  graphCtx.strokeStyle = "black";
  graphCtx.lineWidth = (weight + 1) / 2;
  graphCtx.stroke();
  graphCtx.restore();
};
