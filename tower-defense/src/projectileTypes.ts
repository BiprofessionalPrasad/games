export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  damage: number;
  speed: number;
  type: 'CARROT' | 'PEPPERCORN';
}
