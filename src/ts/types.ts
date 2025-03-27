export enum CAR_CONTROL_TYPE {
  AI = "AI",
  DUMMY = "DUMMY",
  PLAYER = "PLAYER",
}

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  0: Point;
  1: Point;
}

export interface Touch {
  x: number;
  y: number;
  offset: number;
}
