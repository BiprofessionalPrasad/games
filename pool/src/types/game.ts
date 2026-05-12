export interface Vector2D {
  x: number;
  y: number;
}

export type BallType = 'cue' | 'black' | 'red' | 'yellow';

export interface Ball {
  id: number;
  type: BallType;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  mass: number;
  isPocketed: boolean;
}

export const TABLE_WIDTH = 800;
export const TABLE_HEIGHT = 400;
export const BALL_RADIUS = 10;
export const FRICTION = 0.985;
export const WALL_BOUNCE = 0.7;
export const COLLISION_ELASTICITY = 0.9;
export const POCKET_RADIUS = 25;

export const POCKETS: Vector2D[] = [
  { x: 0, y: 0 },
  { x: TABLE_WIDTH / 2, y: 0 },
  { x: TABLE_WIDTH, y: 0 },
  { x: 0, y: TABLE_HEIGHT },
  { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT },
  { x: TABLE_WIDTH, y: TABLE_HEIGHT },
];
