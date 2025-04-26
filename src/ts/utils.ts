import { Touch } from "./types";
import _ from "lodash";

export function lerp(A, B, t) {
  return A + (B - A) * t;
}

export function getIntersection(A, B, C, D): Touch | null {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      };
    }
  }

  return null;
}

export function polysIntersect(poly1, poly2) {
  //   console.log("in intereset");
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const touch = getIntersection(poly1[i], poly1[(i + 1) % poly1.length], poly2[j], poly2[(j + 1) % poly2.length]);
      if (touch) {
        // console.log("touched");
        return true;
      }
    }
  }
  return false;
}

export function activation(val: number) {
  if (val < -1) return -1;
  if (val > 1) return 1;
  return val;
}

export function randomDistribution() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // console.log(num);
  return num;
  // num = num / 10.0 + 0.5; // Translate to 0 -> 1
  // if (num > 1 || num < 0) return randomDistribution(); // resample between 0 and 1
  //num is between 0,1 -> resample to (-2, 2) to make jump form 1 to -1 for example with amount =1
  // return num * 4 - 2;
}

export function randWholeNumInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function deepCopy(obj) {
  return _.cloneDeep(obj);
  if (typeof obj !== "object" || obj === null) {
    return obj; // Return non-object values as is
  }

  let copy;
  if (Array.isArray(obj)) {
    copy = [];
    for (let i = 0; i < obj.length; i++) {
      copy[i] = deepCopy(obj[i]); // Recursively copy array elements
    }
  } else {
    copy = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = deepCopy(obj[key]); // Recursively copy object properties
      }
    }
  }

  return copy;
}
