import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

const Vizualization = () => {
  return (
    <div className="flex flex-col gap-4 grow h-full">
      <Card className="h-3/5">
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent className="grow" id="visuals">
          <canvas id="graph" className="h-full w-full"></canvas>
        </CardContent>
      </Card>
      <Card className="h-2/5">
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent className="grow" id="chartContainer">
          <canvas id="chart" className="h-full w-full"></canvas>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vizualization;
