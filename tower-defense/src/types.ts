export type PlantType = 'SOLAR_ARRAY' | 'CARROT_SHOOTER' | 'PEPPERCORN_MORTAR';

export interface Plant {
  id: string;
  type: PlantType;
  x: number; // Grid X
  y: number; // Grid Y
  lastShot: number;
  lastProduction: number;
}

export const PLANT_STATS = {
  SOLAR_ARRAY: {
    cost: 50,
    production: 25,
    interval: 10000, // 10 seconds
    color: '#f1c40f'
  },
  CARROT_SHOOTER: {
    cost: 100,
    damage: 10,
    range: 200,
    interval: 1000, // 1 second
    color: '#e67e22'
  },
  PEPPERCORN_MORTAR: {
    cost: 175,
    damage: 30,
    range: 300,
    interval: 3000, // 3 seconds
    color: '#27ae60'
  }
};
