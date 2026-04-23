use macroquad::prelude::*;
use crate::maze::Maze;

#[derive(Clone, Copy)]
pub struct Player {
    pub pos: Vec2,
    pub velocity: Vec2,
    pub direction: Vec2,
    pub next_direction: Vec2,
    pub speed: f32,
    pub pixel_size: f32,
}

impl Player {
    pub fn new(x: f32, y: f32) -> Self {
        Player {
            pos: Vec2::new(x, y),
            velocity: Vec2::ZERO,
            direction: Vec2::ZERO,
            next_direction: Vec2::ZERO,
            speed: 150.0,
            pixel_size: 16.0,
        }
    }

    pub fn reset(&mut self) {
        self.pos = Vec2::new(400.0, 300.0);
        self.velocity = Vec2::ZERO;
        self.direction = Vec2::ZERO;
        self.next_direction = Vec2::ZERO;
    }

    pub fn update(&mut self, maze: &Maze) {
        // Try to change direction
        if self.next_direction != Vec2::ZERO {
            let next_pos = self.pos + self.next_direction * self.speed * get_frame_time();
            if maze.can_move_to(next_pos, self.pixel_size) {
                self.direction = self.next_direction;
                self.next_direction = Vec2::ZERO;
            }
        }

        // Move in current direction
        if self.direction != Vec2::ZERO {
            let next_pos = self.pos + self.direction * self.speed * get_frame_time();
            if maze.can_move_to(next_pos, self.pixel_size) {
                self.pos = next_pos;
                self.velocity = self.direction * self.speed;
            } else {
                self.velocity = Vec2::ZERO;
            }
        }

        // Wrap around screen edges
        if self.pos.x < 0.0 {
            self.pos.x = 800.0;
        } else if self.pos.x > 800.0 {
            self.pos.x = 0.0;
        }
        if self.pos.y < 0.0 {
            self.pos.y = 600.0;
        } else if self.pos.y > 600.0 {
            self.pos.y = 0.0;
        }
    }

    pub fn draw(&self) {
        // Draw player as a pixel-art style circle (Pac-Man shape)
        // Body - yellow circle
        draw_circle(self.pos.x, self.pos.y, self.pixel_size / 2.0, Color::new(1.0, 1.0, 0.0, 1.0));

        // Eye - black pixel
        let eye_offset = if self.direction.x > 0.0 {
            Vec2::new(4.0, -4.0)
        } else if self.direction.x < 0.0 {
            Vec2::new(-4.0, -4.0)
        } else if self.direction.y > 0.0 {
            Vec2::new(4.0, 4.0)
        } else if self.direction.y < 0.0 {
            Vec2::new(4.0, -8.0)
        } else {
            Vec2::new(4.0, -4.0)
        };
        draw_circle(self.pos.x + eye_offset.x, self.pos.y + eye_offset.y, 3.0, Color::new(0.0, 0.0, 0.0, 1.0));

        // Mouth - wedge cut out (animate based on time)
        let mouth_open = ((get_time() * 10.0).sin() * 0.3 + 0.2) as f32;
        if self.direction != Vec2::ZERO {
            // Draw mouth wedge
            let mouth_color = Color::new(0.1, 0.1, 0.15, 1.0);

            // Simple approach: draw background-colored triangle for mouth
            let angle = if self.direction.x > 0.0 {
                0.0f32
            } else if self.direction.x < 0.0 {
                std::f32::consts::PI
            } else if self.direction.y > 0.0 {
                std::f32::consts::FRAC_PI_2
            } else {
                -std::f32::consts::FRAC_PI_2
            };

            let mouth_x1 = self.pos.x + (angle - mouth_open).cos() * self.pixel_size / 2.0;
            let mouth_y1 = self.pos.y + (angle - mouth_open).sin() * self.pixel_size / 2.0;
            let mouth_x2 = self.pos.x + (angle + mouth_open).cos() * self.pixel_size / 2.0;
            let mouth_y2 = self.pos.y + (angle + mouth_open).sin() * self.pixel_size / 2.0;

            draw_triangle(
                Vec2::new(self.pos.x, self.pos.y),
                Vec2::new(mouth_x1, mouth_y1),
                Vec2::new(mouth_x2, mouth_y2),
                mouth_color,
            );
        }
    }

    pub fn set_direction(&mut self, dir: Vec2) {
        self.next_direction = dir;
    }
}

#[derive(Clone, Copy)]
pub struct Zombie {
    pub pos: Vec2,
    pub velocity: Vec2,
    pub speed: f32,
    pub scared: bool,
    pub pixel_size: f32,
    pub id: i32,
}

impl Zombie {
    pub fn new(x: f32, y: f32, id: i32) -> Self {
        Zombie {
            pos: Vec2::new(x, y),
            velocity: Vec2::ZERO,
            speed: 100.0,
            scared: false,
            pixel_size: 16.0,
            id,
        }
    }

    pub fn respawn(&mut self) {
        // Spawn at corners
        let spawns = [
            Vec2::new(100.0, 100.0),
            Vec2::new(700.0, 100.0),
            Vec2::new(100.0, 500.0),
            Vec2::new(700.0, 500.0),
        ];
        self.pos = spawns[self.id as usize % 4];
        self.scared = false;
    }

    pub fn update(&mut self, player: &Player, maze: &Maze) {
        // Simple chase AI
        let to_player = player.pos - self.pos;
        let dist = to_player.length();

        if dist > 5.0 {
            let desired_dir = to_player.normalize();

            // Try to move toward player
            let mut move_dir = desired_dir;

            // If scared, run away instead
            if self.scared {
                move_dir = -desired_dir;
            }

            let speed = if self.scared { self.speed * 0.5 } else { self.speed };
            let next_pos = self.pos + move_dir * speed * get_frame_time();

            if maze.can_move_to(next_pos, self.pixel_size) {
                self.pos = next_pos;
                self.velocity = move_dir * speed;
            } else {
                // Try perpendicular directions
                let perp1 = Vec2::new(-move_dir.y, move_dir.x);
                let perp2 = Vec2::new(move_dir.y, -move_dir.x);

                let next_pos1 = self.pos + perp1 * speed * get_frame_time();
                let next_pos2 = self.pos + perp2 * speed * get_frame_time();

                if maze.can_move_to(next_pos1, self.pixel_size) {
                    self.pos = next_pos1;
                    self.velocity = perp1 * speed;
                } else if maze.can_move_to(next_pos2, self.pixel_size) {
                    self.pos = next_pos2;
                    self.velocity = perp2 * speed;
                }
            }
        }

        // Wrap around screen edges
        if self.pos.x < 0.0 {
            self.pos.x = 800.0;
        } else if self.pos.x > 800.0 {
            self.pos.x = 0.0;
        }
        if self.pos.y < 0.0 {
            self.pos.y = 600.0;
        } else if self.pos.y > 600.0 {
            self.pos.y = 0.0;
        }
    }

    pub fn draw(&self) {
        let x = self.pos.x;
        let y = self.pos.y;
        let size = self.pixel_size / 2.0;

        if self.scared {
            // Scared zombie - blue with wavy mouth
            let color = Color::new(0.2, 0.2, 1.0, 1.0);
            draw_circle(x, y, size, color);

            // Wavy mouth
            for i in 0..5 {
                let wave = ((get_time() as f32 * 15.0 + i as f32 * 0.5).sin() * 2.0) as f32;
                draw_circle(
                    x - 6.0 + i as f32 * 3.0,
                    y + 4.0 + wave,
                    1.5,
                    Color::new(0.8, 0.8, 1.0, 1.0),
                );
            }

            // Scared eyes
            draw_circle(x - 4.0, y - 2.0, 2.5, Color::new(1.0, 1.0, 0.5, 1.0));
            draw_circle(x + 4.0, y - 2.0, 2.5, Color::new(1.0, 1.0, 0.5, 1.0));
        } else {
            // Normal zombie - green
            let color = Color::new(0.2, 0.7, 0.2, 1.0);

            // Body
            draw_circle(x, y, size, color);

            // Pixelated body (square with rounded corners effect)
            draw_rectangle(x - size, y - size, size * 2.0, size * 2.0, color);

            // Eyes - red and glowing
            let eye_glow = ((get_time() * 8.0).sin() * 0.2 + 0.8) as f32;
            draw_circle(x - 4.0, y - 3.0, 3.0, Color::new(1.0, 0.0, 0.0, eye_glow));
            draw_circle(x + 4.0, y - 3.0, 3.0, Color::new(1.0, 0.0, 0.0, eye_glow));

            // Pixel details - darker green patches
            draw_rectangle(x - 5.0, y + 2.0, 3.0, 3.0, Color::new(0.1, 0.5, 0.1, 1.0));
            draw_rectangle(x + 2.0, y + 3.0, 3.0, 2.0, Color::new(0.1, 0.5, 0.1, 1.0));
        }
    }
}
