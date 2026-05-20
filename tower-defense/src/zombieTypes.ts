export type ZombieType = 'SOFTWARE_ENGINEER' | 'ELECTRICIAN' | 'PLUMBER';

export interface Zombie {
  id: string;
  type: ZombieType;
  progress: number; // 0 to 1
  health: number;
  maxHealth: number;
  speed: number;
}

export const ZOMBIE_STATS = {
  SOFTWARE_ENGINEER: {
    health: 100,
    speed: 0.0005, // Speed per frame approx
    color: '#3498db',
    label: '💻'
  },
  ELECTRICIAN: {
    health: 60,
    speed: 0.001,
    color: '#f1c40f',
    label: '⚡'
  },
  PLUMBER: {
    health: 200,
    speed: 0.0003,
    color: '#e74c3c',
    label: '🔧'
  }
};
