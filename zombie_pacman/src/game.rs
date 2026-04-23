use crate::entities::{Player, Zombie};
use crate::maze::Maze;
use macroquad::prelude::*;

#[derive(Clone, Copy, PartialEq)]
pub enum GameState {
    Menu,
    Playing,
    GameOver,
}

pub struct Game {
    pub state: GameState,
    pub score: i32,
    pub lives: i32,
    pub level: i32,
    pub game_over: bool,
    pub won: bool,
    pub menu_timer: f32,
    pub player: Player,
    pub maze: Maze,
    pub zombies: Vec<Zombie>,
    pub power_mode_timer: f32,
    pub pellets_remaining: i32,
}

impl Game {
    pub fn new() -> Self {
        let maze = Maze::new();
        let player = Player::new(400.0, 300.0);
        let zombies = vec![
            Zombie::new(100.0, 100.0, 0),
            Zombie::new(700.0, 100.0, 1),
            Zombie::new(100.0, 500.0, 2),
            Zombie::new(700.0, 500.0, 3),
        ];
        let pellets_remaining = maze.count_pellets();

        Game {
            state: GameState::Menu,
            score: 0,
            lives: 3,
            level: 1,
            game_over: false,
            won: false,
            menu_timer: 0.0,
            player,
            maze,
            zombies,
            power_mode_timer: 0.0,
            pellets_remaining,
        }
    }

    pub fn update(&mut self) {
        if self.game_over {
            return;
        }

        // Update power mode timer
        if self.power_mode_timer > 0.0 {
            self.power_mode_timer -= get_frame_time();
            if self.power_mode_timer <= 0.0 {
                // Reset zombies from power mode
                for zombie in &mut self.zombies {
                    zombie.scared = false;
                }
            }
        }

        // Update player
        self.player.update(&self.maze);

        // Check pellet collection
        if let Some((_, is_power)) = self.maze.get_pellet_at(self.player.pos) {
            if is_power {
                self.score += 50;
                self.power_mode_timer = 8.0; // 8 seconds of power mode
                for zombie in &mut self.zombies {
                    zombie.scared = true;
                }
            } else {
                self.score += 10;
            }
            self.maze.collect_pellet(self.player.pos);
            self.pellets_remaining -= 1;

            // Check win condition
            if self.pellets_remaining <= 0 {
                self.won = true;
                self.game_over = true;
            }
        }

        // Update zombies
        for zombie in &mut self.zombies {
            zombie.update(&self.player, &self.maze);
        }

        // Check zombie collision
        for zombie in &mut self.zombies {
            let dist = self.player.pos.distance(zombie.pos);
            if dist < 20.0 {
                if zombie.scared {
                    // Eat zombie - respawn them
                    self.score += 200;
                    zombie.respawn();
                } else {
                    // Player hit
                    self.lives -= 1;
                    if self.lives <= 0 {
                        self.game_over = true;
                        self.won = false;
                    } else {
                        // Reset positions
                        self.player.reset();
                        for z in &mut self.zombies {
                            z.respawn();
                        }
                    }
                    break;
                }
            }
        }
    }

    pub fn draw(&self) {
        // Draw maze
        self.maze.draw();

        // Draw pellets
        self.maze.draw_pellets();

        // Draw power mode indicator
        if self.power_mode_timer > 0.0 {
            let alpha = (self.power_mode_timer.sin() + 1.0) / 2.0 * 0.5 + 0.5;
            draw_text(
                &format!("POWER: {:.1}s", self.power_mode_timer),
                10.0,
                580.0,
                24.0,
                Color::new(1.0, 1.0, 0.0, alpha),
            );
        }

        // Draw player
        self.player.draw();

        // Draw zombies
        for zombie in &self.zombies {
            zombie.draw();
        }

        // Draw HUD
        self.draw_hud();
    }

    fn draw_hud(&self) {
        // Score
        draw_text(
            &format!("SCORE: {}", self.score),
            10.0,
            25.0,
            20.0,
            Color::new(1.0, 1.0, 1.0, 1.0),
        );

        // Lives
        let lives_text = "LIVES: ".to_owned() + &"♥".repeat(self.lives as usize);
        draw_text(&lives_text, 10.0, 50.0, 20.0, Color::new(1.0, 0.2, 0.2, 1.0));

        // Level
        draw_text(
            &format!("LEVEL: {}", self.level),
            700.0,
            25.0,
            20.0,
            Color::new(1.0, 1.0, 1.0, 1.0),
        );

        // Pellets remaining
        draw_text(
            &format!("PELLETS: {}", self.pellets_remaining),
            700.0,
            50.0,
            20.0,
            Color::new(1.0, 1.0, 0.0, 1.0),
        );
    }
}
