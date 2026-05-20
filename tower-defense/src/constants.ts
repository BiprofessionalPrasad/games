export interface Point {
  x: number;
  y: number;
}

export interface Path {
  start: Point;
  cp1: Point;
  cp2: Point;
  end: Point;
}

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const GRID_SIZE = 80; // 10x7 grid roughly
export const PATH_WIDTH = 60;

// S-Curve path
export const MARS_PATH: Path[] = [
  {
    start: { x: 0, y: 300 },
    cp1: { x: 200, y: 300 },
    cp2: { x: 200, y: 100 },
    end: { x: 400, y: 100 }
  },
  {
    start: { x: 400, y: 100 },
    cp1: { x: 600, y: 100 },
    cp2: { x: 600, y: 500 },
    end: { x: 800, y: 500 }
  }
];

export function getPointOnBezier(t: number, p: Path): Point {
  const { start: p0, cp1: p1, cp2: p2, end: p3 } = p;
  const cx = 3 * (p1.x - p0.x);
  const bx = 3 * (p2.x - p1.x) - cx;
  const ax = p3.x - p0.x - cx - bx;

  const cy = 3 * (p1.y - p0.y);
  const by = 3 * (p2.y - p1.y) - cy;
  const ay = p3.y - p0.y - cy - by;

  const x = (ax * Math.pow(t, 3)) + (bx * Math.pow(t, 2)) + (cx * t) + p0.x;
  const y = (ay * Math.pow(t, 3)) + (by * Math.pow(t, 2)) + (cy * t) + p0.y;

  return { x, y };
}

// Get point across entire path (multiple segments)
export function getPointOnFullPath(progress: number): Point {
  const segmentCount = MARS_PATH.length;
  const scaledProgress = progress * segmentCount;
  const segmentIndex = Math.min(Math.floor(scaledProgress), segmentCount - 1);
  const localT = scaledProgress - segmentIndex;
  
  return getPointOnBezier(localT, MARS_PATH[segmentIndex]);
}
