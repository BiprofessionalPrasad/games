use macroquad::prelude::*;
use crate::biome::{Biome, BiomeType};
use crate::entities::{Dino, Obstacle, ObstacleType, Projectile, Weapon, WeaponType};
use crate::evolution::Evolution;
use crate::background::Background;

/// Borrow meter tracks the "borrowed" energy from the ground
/// Must return borrow by landing safely, or face Game Over
pub struct BorrowMeter {
    pub current: f32,
    pub max: f32,
    pub drain_rate: f32,
    pub return_rate: f32,
}

impl BorrowMeter {
    pub const BASE_MAX: f32 = 100.0;
    pub const BASE_DRAIN_RATE: f32 = 30.0;   // Per second while airborne
    pub const BASE_RETURN_RATE: f32 = 50.0;  // Per second while grounded

    pub fn new() -> Self {
        Self {
            current: 0.0,
            max: Self::BASE_MAX,
            drain_rate: Self::BASE_DRAIN_RATE,
            return_rate: Self::BASE_RETURN_RATE,
        }
    }

    /// Attempt to borrow energy for a jump
    pub fn borrow(&mut self, amount: f32) -> Result<(), BorrowError> {
        if self.current + amount > self.max {
            return Err(BorrowError::Overborrow);
        }
        self.current += amount;
        Ok(())
    }

    /// Return borrowed energy when landing
    pub fn return_borrow(&mut self, amount: f32) {
        self.current = (self.current - amount).max(0.0);
    }

    /// Update borrow meter based on airborne/grounded state
    pub fn update(&mut self, dt: f32, is_airborne: bool, drain_multiplier: f32) {
        if is_airborne {
            // Drain while in air (borrowing from ground)
            self.current += self.drain_rate * drain_multiplier * dt;
        } else {
            // Return borrow while grounded
            self.current = (self.current - self.return_rate * dt).max(0.0);
        }
    }

    /// Check if borrow limit exceeded (Game Over condition)
    pub fn is_overdrawn(&self) -> bool {
        self.current > self.max
    }

    /// Get borrow percentage for UI (0.0 to 1.0)
    pub fn borrow_fraction(&self) -> f32 {
        (self.current / self.max).min(1.0)
    }

    /// Color based on danger level
    pub fn warning_color(&self) -> Color {
        let fraction = self.borrow_fraction();
        if fraction > 0.8 {
            RED
        } else if fraction > 0.5 {
            YELLOW
        } else {
            GREEN
        }
    }

    /// Reset for new game
    pub fn reset(&mut self) {
        self.current = 0.0;
    }
}

#[derive(Clone, Copy, PartialEq)]
pub enum BorrowError {
    Overborrow,
}

#[derive(Clone, Copy, PartialEq)]
pub enum GameState {
    Menu,
    Playing,
    GameOver,
    Paused,
}

#[derive(Clone, Copy, PartialEq)]
pub enum GameOverReason {
    BorrowOverflow,      // Stayed airborne too long
    Collision,           // Hit an obstacle
    ArmorBroken,         // Armor absorbed hit but broke
}

/// Main game state container
pub struct Game {
    pub state: GameState,
    pub dino: Dino,
    pub borrow_meter: BorrowMeter,
    pub biome: Biome,
    pub evolution: Evolution,
    pub background: Background,
    pub obstacles: Vec<Obstacle>,
    pub projectiles: Vec<Projectile>,
    pub weapon: Weapon,
    pub score: u32,
    pub distance: f32,
    pub game_speed: f32,
    pub ground_y: f32,
    pub screen_width: f32,
    pub screen_height: f32,
    pub game_over_reason: Option<GameOverReason>,
    pub obstacle_spawn_timer: f32,
    pub high_score: u32,
}

impl Game {
    pub fn new(screen_width: f32, screen_height: f32) -> Self {
        let ground_y = screen_height * 0.75;

        Self {
            state: GameState::Menu,
            dino: Dino::new(100.0, ground_y - 50.0),
            borrow_meter: BorrowMeter::new(),
            biome: Biome::new(),
            evolution: Evolution::new(),
            background: Background::new(screen_width, screen_height),
            obstacles: Vec::new(),
            projectiles: Vec::new(),
            weapon: Weapon::new(WeaponType::Laser),
            score: 0,
            distance: 0.0,
            game_speed: 300.0,
            ground_y,
            screen_width,
            screen_height,
            game_over_reason: None,
            obstacle_spawn_timer: 0.0,
            high_score: 0,
        }
    }

    pub fn reset(&mut self) {
        self.dino.reset(100.0, self.ground_y - 50.0);
        self.borrow_meter.reset();
        self.biome = Biome::new();
        self.evolution = Evolution::new();
        self.obstacles.clear();
        self.projectiles.clear();
        self.score = 0;
        self.distance = 0.0;
        self.game_speed = 300.0;
        self.game_over_reason = None;
        self.obstacle_spawn_timer = 0.0;
        self.background.set_biome(BiomeType::Desert, self.screen_width);
    }

    pub fn handle_input(&mut self) {
        if self.state != GameState::Playing {
            return;
        }

        // Jump input (borrow energy)
        if is_key_pressed(KeyCode::Space) {
            let physics = self.biome.physics();
            let jump_borrow = 25.0; // Cost per jump

            if self.dino.is_grounded {
                // First jump from ground
                let _ = self.borrow_meter.borrow(jump_borrow);
                self.dino.jump(&physics, jump_borrow);
            } else if self.evolution.has_double_jump() && self.dino.jump_count == 1 {
                // Double jump (Swift/Ultimate only)
                if self.borrow_meter.borrow(jump_borrow).is_ok() {
                    self.dino.jump(&physics, jump_borrow);
                }
            }
        }

        // Glide input (hold space while gliding)
        if is_key_down(KeyCode::Space) && self.evolution.has_glide() && !self.dino.is_grounded {
            self.dino.start_glide();
        } else {
            self.dino.stop_gliding();
        }

        // Fire weapon
        if is_key_pressed(KeyCode::F) {
            if let Some(proj) = self.weapon.fire(self.dino.x, self.dino.y) {
                self.projectiles.push(proj);
            }
        }

        // Pause
        if is_key_pressed(KeyCode::Escape) {
            self.state = GameState::Paused;
        }
    }

    pub fn update(&mut self, dt: f32) {
        if self.state != GameState::Playing {
            return;
        }

        let physics = self.biome.physics();
        let drain_mult = self.evolution.borrow_drain_multiplier();

        // Update borrow meter
        self.borrow_meter
            .update(dt, !self.dino.is_grounded, drain_mult);

        // Check borrow overflow (Game Over)
        if self.borrow_meter.is_overdrawn() {
            self.state = GameState::GameOver;
            self.game_over_reason = Some(GameOverReason::BorrowOverflow);
            return;
        }

        // Update dino physics
        self.dino.update(dt, &physics, self.ground_y);

        // Update evolution (check for new stages)
        self.evolution.check_evolve(self.score);
        self.dino.has_armor = self.evolution.has_armor();
        self.dino.max_jumps = self.evolution.max_jumps();

        // Update weapon cooldown
        self.weapon.update(dt);

        // Update projectiles
        for proj in &mut self.projectiles {
            proj.update(dt);
        }
        self.projectiles
            .retain(|p| !p.is_off_screen(self.screen_width));

        // Spawn obstacles
        self.obstacle_spawn_timer -= dt;
        if self.obstacle_spawn_timer <= 0.0 {
            self.spawn_obstacle();
            self.obstacle_spawn_timer = 1.5 + rand::gen_range(0.5, 2.0);
        }

        // Update obstacles
        for obs in &mut self.obstacles {
            obs.update(self.game_speed, dt);
        }

        // Remove off-screen obstacles
        self.obstacles.retain(|o| !o.is_off_screen());

        // Check collisions
        self.check_collisions();

        // Update score and distance
        self.distance += self.game_speed * dt;
        self.score = (self.distance / 10.0) as u32;

        // Increase game speed over time
        self.game_speed = 300.0 + (self.score as f32 / 100.0) * 50.0;

        // Update biome
        self.biome.update(dt);

        // Update background
        self.background.update(self.game_speed, dt);
    }

    fn spawn_obstacle(&mut self) {
        let obstacle_type = match self.biome.biome_type {
            BiomeType::Cyberpunk => ObstacleType::CyberDrone,
            _ => {
                if rand::gen_range(0.0, 1.0) < 0.3 {
                    ObstacleType::Bird
                } else {
                    ObstacleType::Cactus
                }
            }
        };

        let obs = Obstacle::new(
            self.screen_width + 50.0,
            self.ground_y,
            obstacle_type,
        );
        self.obstacles.push(obs);
    }

    fn check_collisions(&mut self) {
        // Projectile vs Obstacle
        let mut projectiles_to_remove = Vec::new();
        let mut obstacles_to_remove = Vec::new();

        for (p_idx, proj) in self.projectiles.iter().enumerate() {
            for (o_idx, obs) in self.obstacles.iter().enumerate() {
                if check_collision(&proj.rect(), &obs.rect()) {
                    projectiles_to_remove.push(p_idx);
                    // Plasma pierces, other weapons destroy on hit
                    if proj.projectile_type != WeaponType::Plasma {
                        obstacles_to_remove.push(o_idx);
                    }
                    break;
                }
            }
        }

        // Remove collided entities (reverse order to preserve indices)
        projectiles_to_remove.sort();
        obstacles_to_remove.sort();

        for idx in projectiles_to_remove.into_iter().rev() {
            self.projectiles.remove(idx);
        }
        for idx in obstacles_to_remove.into_iter().rev() {
            self.obstacles.remove(idx);
        }

        // Dino vs Obstacle
        let mut hit_obstacle_idx = None;
        for (idx, obs) in self.obstacles.iter().enumerate() {
            if check_collision(&self.dino.rect(), &obs.rect()) {
                if self.dino.take_damage() {
                    // Armor absorbed the hit
                    self.game_over_reason = Some(GameOverReason::ArmorBroken);
                    hit_obstacle_idx = Some(idx);
                } else {
                    // No armor - Game Over
                    self.state = GameState::GameOver;
                    self.game_over_reason = Some(GameOverReason::Collision);
                }
                break;
            }
        }

        // Remove the obstacle that hit us (if armor absorbed)
        if let Some(idx) = hit_obstacle_idx {
            self.obstacles.remove(idx);
        }
    }

    pub fn draw(&self) {
        // Draw background layers
        self.background.draw();

        // Draw ground line
        draw_line(
            0.0,
            self.ground_y,
            self.screen_width,
            self.ground_y,
            2.0,
            self.biome.biome_type.layer_colors()[2],
        );

        // Draw obstacles
        for obs in &self.obstacles {
            obs.draw();
        }

        // Draw projectiles
        for proj in &self.projectiles {
            proj.draw();
        }

        // Draw dino
        self.dino.draw();

        // Draw UI
        self.draw_ui();

        // Draw evolution flash overlay
        if self.evolution.is_flashing() {
            draw_rectangle(
                0.0,
                0.0,
                self.screen_width,
                self.screen_height,
                Color::new(1.0, 1.0, 0.0, self.evolution.flash_alpha() * 0.3),
            );
        }

        // Draw biome transition overlay
        if self.biome.is_transitioning {
            draw_rectangle(
                0.0,
                0.0,
                self.screen_width,
                self.screen_height,
                Color::new(0.5, 0.5, 0.5, self.biome.transition_alpha() * 0.3),
            );
        }

        // Draw biome warning
        if self.biome.should_warn() {
            let alpha = (self.biome.warning_timer / Biome::WARNING_DURATION).min(1.0);
            draw_rectangle(
                0.0,
                0.0,
                self.screen_width,
                self.screen_height,
                Color::new(1.0, 0.0, 0.0, alpha * 0.2),
            );

            draw_text(
                &format!("BIOME CHANGE: {}", self.biome.biome_type.next().name()),
                self.screen_width / 2.0 - 150.0,
                100.0,
                40.0,
                RED,
            );
        }
    }

    fn draw_ui(&self) {
        // Draw score
        draw_text(
            &format!("SCORE: {}", self.score),
            20.0,
            40.0,
            30.0,
            WHITE,
        );

        // Draw high score
        draw_text(
            &format!("BEST: {}", self.high_score.max(self.score)),
            20.0,
            70.0,
            20.0,
            GRAY,
        );

        // Draw borrow meter
        let meter_width = 200.0;
        let meter_height = 20.0;
        let meter_x = self.screen_width - meter_width - 20.0;
        let meter_y = 20.0;

        // Background
        draw_rectangle(meter_x, meter_y, meter_width, meter_height, DARKGRAY);

        // Fill based on current borrow
        let fill_width = meter_width * self.borrow_meter.borrow_fraction();
        draw_rectangle(
            meter_x,
            meter_y,
            fill_width,
            meter_height,
            self.borrow_meter.warning_color(),
        );

        // Border
        draw_rectangle_lines(meter_x, meter_y, meter_width, meter_height, 2.0, WHITE);

        // Label
        draw_text("BORROW", meter_x, meter_y - 5.0, 15.0, WHITE);

        // Draw weapon cooldown
        let weapon_x = self.screen_width - 100.0;
        let weapon_y = 60.0;
        draw_text("WEAPON", weapon_x, weapon_y, 15.0, WHITE);

        // Cooldown bar
        let cooldown_width = 80.0;
        let cooldown_height = 10.0;
        draw_rectangle(weapon_x, weapon_y + 5.0, cooldown_width, cooldown_height, DARKGRAY);
        draw_rectangle(
            weapon_x,
            weapon_y + 5.0,
            cooldown_width * self.weapon.cooldown_progress(),
            cooldown_height,
            if self.weapon.can_fire() { GREEN } else { RED },
        );

        // Draw biome indicator
        let biome_x = self.screen_width / 2.0 - 50.0;
        draw_text(
            self.biome.biome_type.name(),
            biome_x,
            40.0,
            25.0,
            self.biome.biome_type.background_color(),
        );

        // Draw evolution stage
        let evo_x = 20.0;
        let evo_y = 100.0;
        draw_text(
            &format!("EVO: {}", self.evolution.stage.name()),
            evo_x,
            evo_y,
            20.0,
            GOLD,
        );
    }

    pub fn draw_menu(&self) {
        clear_background(BLACK);

        let title = "BORROW DINO";
        let title_width = measure_text(title, None, 60, 1.0).width;
        draw_text(
            title,
            self.screen_width / 2.0 - title_width / 2.0,
            150.0,
            60.0,
            GREEN,
        );

        let subtitle = "The Borrow Checker Game";
        let sub_width = measure_text(subtitle, None, 30, 1.0).width;
        draw_text(
            subtitle,
            self.screen_width / 2.0 - sub_width / 2.0,
            190.0,
            30.0,
            GRAY,
        );

        // Instructions
        let instructions = [
            "SPACE - Jump (borrows energy)",
            "Hold SPACE - Glide (Winged evolution)",
            "F - Fire laser",
            "ESC - Pause",
            "",
            "LAND SAFELY to return your borrow!",
            "Stay airborne too long = GAME OVER",
        ];

        for (i, line) in instructions.iter().enumerate() {
            let width = measure_text(line, None, 25, 1.0).width;
            draw_text(
                line,
                self.screen_width / 2.0 - width / 2.0,
                280.0 + i as f32 * 35.0,
                25.0,
                WHITE,
            );
        }

        let start_prompt = "Press SPACE to Start";
        let start_width = measure_text(start_prompt, None, 40, 1.0).width;
        draw_text(
            start_prompt,
            self.screen_width / 2.0 - start_width / 2.0,
            500.0,
            40.0,
            YELLOW,
        );
    }

    pub fn draw_game_over(&self) {
        // Semi-transparent overlay
        draw_rectangle(
            0.0,
            0.0,
            self.screen_width,
            self.screen_height,
            Color::new(0.0, 0.0, 0.0, 0.7),
        );

        let reason_text = match self.game_over_reason {
            Some(GameOverReason::BorrowOverflow) => "BORROW OVERFLOW!",
            Some(GameOverReason::Collision) => "COLLISION!",
            Some(GameOverReason::ArmorBroken) => "ARMOR BROKEN!",
            None => "GAME OVER",
        };

        let width = measure_text(reason_text, None, 50, 1.0).width;
        draw_text(
            reason_text,
            self.screen_width / 2.0 - width / 2.0,
            200.0,
            50.0,
            RED,
        );

        let score_text = format!("Score: {}", self.score);
        let score_width = measure_text(&score_text, None, 40, 1.0).width;
        draw_text(
            &score_text,
            self.screen_width / 2.0 - score_width / 2.0,
            280.0,
            40.0,
            WHITE,
        );

        let restart = "Press SPACE to Restart";
        let restart_width = measure_text(restart, None, 30, 1.0).width;
        draw_text(
            restart,
            self.screen_width / 2.0 - restart_width / 2.0,
            380.0,
            30.0,
            YELLOW,
        );
    }

    pub fn draw_pause(&self) {
        draw_rectangle(
            0.0,
            0.0,
            self.screen_width,
            self.screen_height,
            Color::new(0.0, 0.0, 0.0, 0.5),
        );

        let text = "PAUSED";
        let width = measure_text(text, None, 60, 1.0).width;
        draw_text(
            text,
            self.screen_width / 2.0 - width / 2.0,
            self.screen_height / 2.0,
            60.0,
            WHITE,
        );

        let resume = "Press ESC to Resume";
        let resume_width = measure_text(resume, None, 30, 1.0).width;
        draw_text(
            resume,
            self.screen_width / 2.0 - resume_width / 2.0,
            self.screen_height / 2.0 + 60.0,
            30.0,
            GRAY,
        );
    }
}

fn check_collision(a: &Rect, b: &Rect) -> bool {
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
