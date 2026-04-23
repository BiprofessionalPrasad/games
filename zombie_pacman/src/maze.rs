use macroquad::prelude::*;

const CELL_SIZE: f32 = 40.0;
const COLS: i32 = 20;
const ROWS: i32 = 15;

// 1 = wall, 0 = pellet, 2 = power pellet, 3 = empty (ghost house)
// Classic maze layout
const MAZE_LAYOUT: [[i32; 20]; 15] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 3, 3, 3, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 2, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

pub struct Maze {
    pub walls: Vec<Rect>,
    pub pellets: Vec<(Vec2, bool)>, // (position, is_power)
}

impl Maze {
    pub fn new() -> Self {
        let mut walls = Vec::new();
        let mut pellets = Vec::new();

        for row in 0..ROWS {
            for col in 0..COLS {
                let cell = MAZE_LAYOUT[row as usize][col as usize];
                let x = col as f32 * CELL_SIZE;
                let y = row as f32 * CELL_SIZE;

                if cell == 1 {
                    // Wall
                    walls.push(Rect::new(x, y, CELL_SIZE, CELL_SIZE));
                } else if cell == 0 {
                    // Regular pellet
                    pellets.push((Vec2::new(x + CELL_SIZE / 2.0, y + CELL_SIZE / 2.0), false));
                } else if cell == 2 {
                    // Power pellet
                    pellets.push((Vec2::new(x + CELL_SIZE / 2.0, y + CELL_SIZE / 2.0), true));
                }
                // cell == 3 is empty (ghost house)
            }
        }

        Maze { walls, pellets }
    }

    pub fn count_pellets(&self) -> i32 {
        self.pellets.len() as i32
    }

    pub fn can_move_to(&self, pos: Vec2, size: f32) -> bool {
        let half_size = size / 2.0;
        let test_rect = Rect::new(
            pos.x - half_size,
            pos.y - half_size,
            size,
            size,
        );

        for wall in &self.walls {
            if rects_overlap(&test_rect, wall) {
                return false;
            }
        }

        // Check bounds
        if pos.x - half_size < 0.0 || pos.x + half_size > 800.0 {
            return false;
        }
        if pos.y - half_size < 0.0 || pos.y + half_size > 600.0 {
            return false;
        }

        true
    }

    pub fn get_pellet_at(&self, pos: Vec2) -> Option<(Vec2, bool)> {
        let collection_radius = 15.0;
        for (pellet_pos, is_power) in &self.pellets {
            if pellet_pos.distance(pos) < collection_radius {
                return Some((*pellet_pos, *is_power));
            }
        }
        None
    }

    pub fn collect_pellet(&mut self, pos: Vec2) {
        let collection_radius = 15.0;
        self.pellets.retain(|(pellet_pos, _)| {
            pellet_pos.distance(pos) >= collection_radius
        });
    }

    pub fn draw(&self) {
        for wall in &self.walls {
            // Draw wall with brick pattern effect
            let base_color = Color::new(0.2, 0.3, 0.6, 1.0);

            // Main wall
            draw_rectangle(wall.x, wall.y, wall.w, wall.h, base_color);

            // Brick border
            draw_rectangle(wall.x, wall.y, wall.w, 2.0, Color::new(0.3, 0.4, 0.7, 1.0));
            draw_rectangle(wall.x, wall.y, 2.0, wall.h, Color::new(0.3, 0.4, 0.7, 1.0));
            draw_rectangle(
                wall.x + wall.w - 2.0,
                wall.y,
                2.0,
                wall.h,
                Color::new(0.15, 0.25, 0.5, 1.0),
            );
            draw_rectangle(
                wall.x,
                wall.y + wall.h - 2.0,
                wall.w,
                2.0,
                Color::new(0.15, 0.25, 0.5, 1.0),
            );

            // Pixel detail - darker center
            draw_rectangle(
                wall.x + 5.0,
                wall.y + 5.0,
                wall.w - 10.0,
                wall.h - 10.0,
                Color::new(0.15, 0.2, 0.4, 1.0),
            );
        }
    }

    pub fn draw_pellets(&self) {
        for (pos, is_power) in &self.pellets {
            if *is_power {
                // Power pellet - pulsing
                let pulse = ((get_time() * 5.0).sin() * 0.3 + 0.7) as f32;
                let size = 8.0 * pulse;
                draw_circle(pos.x, pos.y, size, Color::new(1.0, 1.0, 0.5, 1.0));
                draw_circle(pos.x, pos.y, size * 0.6, Color::new(1.0, 0.8, 0.0, 1.0));
            } else {
                // Regular pellet - small dot
                draw_circle(pos.x, pos.y, 3.0, Color::new(1.0, 0.8, 0.8, 0.8));
            }
        }
    }
}

fn rects_overlap(a: &Rect, b: &Rect) -> bool {
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
