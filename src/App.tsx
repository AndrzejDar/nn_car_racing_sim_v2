import { useEffect } from "react";
import { initialize, start, stop } from "./ts/main";
import { Button } from "./components/ui/button";
import SideMenu from "./components/sideMenu";
import Simulation from "./components/simulation";
import Vizualization from "./components/vizuaization";

function App() {
  useEffect(() => {
    initialize();
  });

  return (
    <>
      <div className="h-screen w-screen bg-gray-400 overflow-hidden flex flex-row p-3">
        <div className="border-solid border-black border flex flex-row p-1 grow rounded-xl">
          <SideMenu />
          <Simulation />
          <Vizualization />
          {/* <div id="buttons"> */}
          {/* <button onClick={start}>start</button> */}
          {/* <button onClick={stop}>stop</button> */}
          {/* <Button onClick={start}>button</Button> */}
          {/* <button onClick={kill}>kill remaining</button>
          <button onClick={reset}>reset</button>
          <button onClick={save}>save car for seeding next gen</button>
          <button onClick="remove()">remove</button>
          <button id="counter"></button>
          <button id="genCounter"></button> */}
          {/* </div> */}
        </div>
      </div>
    </>
  );
}

export default App;
