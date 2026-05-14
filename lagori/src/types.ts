export type GameState = 'IDLE' | 'BREAKING' | 'PLAYING' | 'GAME_OVER';

export interface Position {
  x: number;
  y: number;
}

export interface StoneData {
  id: number;
  position: Position;
  isStacked: boolean;
  order: number; // For stacking order
  rotation?: number;
}

export interface BallData {
  position: Position;
  velocity: Position;
  isHeld: boolean;
  heldBy: 'PLAYER' | 'OPPONENT' | null;
}

export interface PlayerData {
  position: Position;
  score: number;
  stonesHeld: number;
}
