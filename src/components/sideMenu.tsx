import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { start, stop } from "@/ts/main";

const SideMenu = () => {
  return (
    <Card className="min-w-[300px] shadow-md">
      <CardHeader>
        <CardTitle>Navigation</CardTitle>
        <CardDescription>Desc</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={start}>start</Button>
        <Button onClick={stop}>stop</Button>
        <Button>asdf</Button>
        <Button>asdf</Button>
        <Button>asdf</Button>
        <Button>asdf</Button>
      </CardContent>
    </Card>
  );
};

export default SideMenu;
