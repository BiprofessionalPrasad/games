import { Ball, TABLE_WIDTH, TABLE_HEIGHT, FRICTION, WALL_BOUNCE, COLLISION_ELASTICITY, POCKETS, POCKET_RADIUS } from '../types/game';
import { add, subtract, multiply, dot, distance, normalize } from '../utils/math';

export const checkBallPocketed = (ball: Ball): boolean => {
  if (ball.isPocketed) return true;
  return POCKETS.some(pocket => distance(ball.position, pocket) < POCKET_RADIUS);
};

export const updateBallPosition = (ball: Ball): Ball => {
  if (ball.isPocketed) return ball;

  let newVelocity = multiply(ball.velocity, FRICTION);
  
  // Stop if velocity is very low
  if (Math.abs(newVelocity.x) < 0.1) newVelocity.x = 0;
  if (Math.abs(newVelocity.y) < 0.1) newVelocity.y = 0;

  let newPosition = add(ball.position, newVelocity);

  // Wall collisions
  if (newPosition.x - ball.radius < 0) {
    newPosition.x = ball.radius;
    newVelocity.x = -newVelocity.x * WALL_BOUNCE;
  } else if (newPosition.x + ball.radius > TABLE_WIDTH) {
    newPosition.x = TABLE_WIDTH - ball.radius;
    newVelocity.x = -newVelocity.x * WALL_BOUNCE;
  }

  if (newPosition.y - ball.radius < 0) {
    newPosition.y = ball.radius;
    newVelocity.y = -newVelocity.y * WALL_BOUNCE;
  } else if (newPosition.y + ball.radius > TABLE_HEIGHT) {
    newPosition.y = TABLE_HEIGHT - ball.radius;
    newVelocity.y = -newVelocity.y * WALL_BOUNCE;
  }

  return { ...ball, position: newPosition, velocity: newVelocity };
};

export const resolveBallCollision = (b1: Ball, b2: Ball): [Ball, Ball] => {
  const dist = distance(b1.position, b2.position);
  const minConfigDist = b1.radius + b2.radius;

  if (dist >= minConfigDist) return [b1, b2];

  // 1. Resolve Overlap (static resolution)
  const collisionNormal = normalize(subtract(b1.position, b2.position));
  const overlap = minConfigDist - dist;
  const moveVector = multiply(collisionNormal, overlap / 2);

  const p1 = add(b1.position, moveVector);
  const p2 = subtract(b2.position, moveVector);

  // 2. Resolve Velocity (dynamic resolution)
  const relativeVelocity = subtract(b1.velocity, b2.velocity);
  const velocityAlongNormal = dot(relativeVelocity, collisionNormal);

  // Do not resolve if velocities are separating
  if (velocityAlongNormal > 0) {
    return [
      { ...b1, position: p1 },
      { ...b2, position: p2 }
    ];
  }

  const impulseMagnitude = -(1 + COLLISION_ELASTICITY) * velocityAlongNormal;
  const impulse = multiply(collisionNormal, impulseMagnitude / (1 / b1.mass + 1 / b2.mass));

  const v1 = add(b1.velocity, multiply(impulse, 1 / b1.mass));
  const v2 = subtract(b2.velocity, multiply(impulse, 1 / b2.mass));

  return [
    { ...b1, position: p1, velocity: v1 },
    { ...b2, position: p2, velocity: v2 }
  ];
};
