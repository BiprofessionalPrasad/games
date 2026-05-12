import { Vector2D } from '../types/game';

export const add = (v1: Vector2D, v2: Vector2D): Vector2D => ({
  x: v1.x + v2.x,
  y: v1.y + v2.y,
});

export const subtract = (v1: Vector2D, v2: Vector2D): Vector2D => ({
  x: v1.x - v2.x,
  y: v1.y - v2.y,
});

export const multiply = (v: Vector2D, scalar: number): Vector2D => ({
  x: v.x * scalar,
  y: v.y * scalar,
});

export const dot = (v1: Vector2D, v2: Vector2D): number => v1.x * v2.x + v1.y * v2.y;

export const length = (v: Vector2D): number => Math.sqrt(v.x * v.x + v.y * v.y);

export const normalize = (v: Vector2D): Vector2D => {
  const len = length(v);
  return len === 0 ? { x: 0, y: 0 } : multiply(v, 1 / len);
};

export const distance = (v1: Vector2D, v2: Vector2D): number => length(subtract(v1, v2));
