import { useEffect } from "react";
import "./App.css";
import { initialize, start, stop } from "./ts/main";

function App() {
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "/myScript.js";
  //   script.async = true;
  //   document.body.appendChild(script);
  // }, []);

  useEffect(() => {
    initialize();
  });

  return (
    <>
      <div className="w-full h-full bg-gray-400 overflow-hidden">
        <div id="buttons">
          <button onClick={start}>start</button>
          <button onClick={stop}>stop</button>
          {/* <button onClick={kill}>kill remaining</button>
          <button onClick={reset}>reset</button>
          <button onClick={save}>save car for seeding next gen</button>
          <button onClick="remove()">remove</button>
          <button id="counter"></button>
          <button id="genCounter"></button> */}
        </div>
        <canvas id="myCanvas"> </canvas>

        <div id="visuals">
          <canvas id="graph"> </canvas>
          <canvas id="chart"> </canvas>
        </div>
      </div>
    </>
  );
}

export default App;
