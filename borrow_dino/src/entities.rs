use macroquad::prelude::*;
use crate::biome::PhysicsConfig;

/// Dino entity with physics and borrow-based jumping
pub struct Dino {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub vx: f32,
    pub vy: f32,
    pub is_grounded: bool,
    pub is_gliding: bool,
    pub can_double_jump: bool,
    pub has_armor: bool,
    pub armor_active: bool,
    pub jump_count: u32,
    pub max_jumps: u32,
    pub glides_remaining: bool,
}

impl Dino {
    pub fn new(x: f32, y: f32) -> Self {
        Self {
            x,
            y,
            width: 40.0,
            height: 50.0,
            vx: 0.0,
            vy: 0.0,
            is_grounded: true,
            is_gliding: false,
            can_double_jump: false,
            has_armor: false,
            armor_active: false,
            jump_count: 0,
            max_jumps: 1,
            glides_remaining: true,
        }
    }

    pub fn jump(&mut self, physics: &PhysicsConfig, _borrow_amount: f32) -> bool {
        if self.jump_count >= self.max_jumps {
            return false;
        }
        self.vy = -physics.jump_force;
        self.is_grounded = false;
        self.jump_count += 1;
        self.glides_remaining = true;
        true
    }

    pub fn start_glide(&mut self) {
        if self.glides_remaining && !self.is_grounded {
            self.is_gliding = true;
            self.glides_remaining = false;
        }
    }

    pub fn stop_gliding(&mut self) {
        self.is_gliding = false;
    }

    pub fn take_damage(&mut self) -> bool {
        // Returns true if damage was absorbed (armor saved you)
        if self.has_armor && !self.armor_active {
            self.armor_active = true;
            true
        } else {
            false
        }
    }

    pub fn reset(&mut self, x: f32, y: f32) {
        self.x = x;
        self.y = y;
        self.vx = 0.0;
        self.vy = 0.0;
        self.is_grounded = true;
        self.is_gliding = false;
        self.jump_count = 0;
        self.armor_active = false;
        self.glides_remaining = true;
    }

    pub fn update(&mut self, dt: f32, physics: &PhysicsConfig, ground_y: f32) {
        // Apply gravity
        self.vy += physics.gravity * dt;

        // Glide reduces gravity effect
        if self.is_gliding {
            self.vy *= 0.5;
        }

        // Apply velocity
        self.y += self.vy * dt;

        // Ground collision
        if self.y >= ground_y - self.height {
            self.y = ground_y - self.height;
            self.vy = 0.0;
            self.is_grounded = true;
            self.jump_count = 0;
            self.stop_gliding();
        } else {
            self.is_grounded = false;
        }
    }

    pub fn draw(&self) {
        // Body color changes based on state
        let color = if self.armor_active {
            GOLD
        } else if self.is_gliding {
            SKYBLUE
        } else {
            BROWN
        };

        // Draw dino body
        draw_rectangle(self.x, self.y, self.width, self.height, color);

        // Draw eye
        let eye_x = self.x + self.width - 12.0;
        let eye_y = self.y + 10.0;
        draw_circle(eye_x, eye_y, 4.0, WHITE);
        draw_circle(eye_x + 2.0, eye_y, 2.0, BLACK);

        // Draw armor shield if active
        if self.armor_active {
            draw_rectangle_lines(
                self.x - 5.0,
                self.y - 5.0,
                self.width + 10.0,
                self.height + 10.0,
                3.0,
                GOLD,
            );
        }
    }

    pub fn rect(&self) -> Rect {
        Rect::new(self.x, self.y, self.width, self.height)
    }
}

/// Obstacle types
#[derive(Clone, Copy)]
pub enum ObstacleType {
    Cactus,     // Standard ground obstacle
    Bird,       // Flying obstacle (higher y position)
    CyberDrone, // Cyberpunk biome obstacle
}

impl ObstacleType {
    pub fn dimensions(&self) -> (f32, f32) {
        match self {
            ObstacleType::Cactus => (30.0, 50.0),
            ObstacleType::Bird => (40.0, 25.0),
            ObstacleType::CyberDrone => (35.0, 35.0),
        }
    }

    pub fn color(&self) -> Color {
        match self {
            ObstacleType::Cactus => GREEN,
            ObstacleType::Bird => RED,
            ObstacleType::CyberDrone => PURPLE,
        }
    }
}

/// Obstacle entity
pub struct Obstacle {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub obstacle_type: ObstacleType,
    pub passed: bool,
}

impl Obstacle {
    pub fn new(x: f32, ground_y: f32, obstacle_type: ObstacleType) -> Self {
        let (width, height) = obstacle_type.dimensions();
        let y = match obstacle_type {
            ObstacleType::Cactus => ground_y - height,
            ObstacleType::Bird => ground_y - 100.0 - height,
            ObstacleType::CyberDrone => ground_y - 80.0 - height,
        };

        Self {
            x,
            y,
            width,
            height,
            obstacle_type,
            passed: false,
        }
    }

    pub fn update(&mut self, speed: f32, dt: f32) {
        self.x -= speed * dt;
    }

    pub fn draw(&self) {
        let color = self.obstacle_type.color();
        draw_rectangle(self.x, self.y, self.width, self.height, color);

        // Add detail based on type
        match self.obstacle_type {
            ObstacleType::Cactus => {
                // Draw cactus arms
                draw_rectangle(self.x + 5.0, self.y + 15.0, 5.0, 15.0, color);
                draw_rectangle(self.x + self.width - 10.0, self.y + 10.0, 5.0, 15.0, color);
            }
            ObstacleType::Bird => {
                // Draw wings
                draw_rectangle(self.x + 10.0, self.y + 5.0, 20.0, 5.0, DARKGRAY);
            }
            ObstacleType::CyberDrone => {
                // Draw drone glow
                draw_circle(self.x + self.width / 2.0, self.y + self.height / 2.0, 8.0, PINK);
            }
        }
    }

    pub fn rect(&self) -> Rect {
        Rect::new(self.x, self.y, self.width, self.height)
    }

    pub fn is_off_screen(&self) -> bool {
        self.x + self.width < 0.0
    }
}

/// Weapon types
#[derive(Clone, Copy, PartialEq)]
pub enum WeaponType {
    Laser,   // Fast, low cooldown
    Plasma,  // Piercing, medium cooldown
    Shotgun, // Spread, high cooldown
}

impl WeaponType {
    pub fn cooldown(&self) -> f32 {
        match self {
            WeaponType::Laser => 0.5,
            WeaponType::Plasma => 1.0,
            WeaponType::Shotgun => 1.5,
        }
    }

    pub fn damage(&self) -> u32 {
        match self {
            WeaponType::Laser => 1,
            WeaponType::Plasma => 2,
            WeaponType::Shotgun => 3,
        }
    }
}

/// Projectile entity
pub struct Projectile {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub vx: f32,
    pub projectile_type: WeaponType,
    pub pierce_count: u32,
}

impl Projectile {
    pub fn new(x: f32, y: f32, projectile_type: WeaponType) -> Self {
        let (width, height) = match projectile_type {
            WeaponType::Laser => (20.0, 4.0),
            WeaponType::Plasma => (15.0, 15.0),
            WeaponType::Shotgun => (8.0, 8.0),
        };

        Self {
            x,
            y,
            width,
            height,
            vx: 600.0,
            projectile_type,
            pierce_count: if projectile_type == WeaponType::Plasma { 3 } else { 1 },
        }
    }

    pub fn update(&mut self, dt: f32) {
        self.x += self.vx * dt;
    }

    pub fn draw(&self) {
        let color = match self.projectile_type {
            WeaponType::Laser => YELLOW,
            WeaponType::Plasma => ORANGE,
            WeaponType::Shotgun => WHITE,
        };

        match self.projectile_type {
            WeaponType::Laser => {
                draw_rectangle(self.x, self.y, self.width, self.height, color);
            }
            WeaponType::Plasma => {
                draw_circle(self.x + self.width / 2.0, self.y + self.height / 2.0, self.width / 2.0, color);
            }
            WeaponType::Shotgun => {
                draw_circle(self.x + self.width / 2.0, self.y + self.height / 2.0, self.width / 2.0, color);
            }
        }
    }

    pub fn rect(&self) -> Rect {
        Rect::new(self.x, self.y, self.width, self.height)
    }

    pub fn is_off_screen(&self, screen_width: f32) -> bool {
        self.x > screen_width
    }
}

/// Weapon with cooldown management
pub struct Weapon {
    pub weapon_type: WeaponType,
    pub cooldown_timer: f32,
    pub ammo: Option<u32>,
}

impl Weapon {
    pub fn new(weapon_type: WeaponType) -> Self {
        Self {
            weapon_type,
            cooldown_timer: 0.0,
            ammo: None, // Infinite ammo by default
        }
    }

    pub fn can_fire(&self) -> bool {
        self.cooldown_timer <= 0.0 && self.ammo.map_or(true, |a| a > 0)
    }

    pub fn fire(&mut self, dino_x: f32, dino_y: f32) -> Option<Projectile> {
        if !self.can_fire() {
            return None;
        }

        self.cooldown_timer = self.weapon_type.cooldown();

        if let Some(ref mut ammo) = self.ammo {
            *ammo -= 1;
        }

        let projectile_y = match self.weapon_type {
            WeaponType::Laser => dino_y + 20.0,
            WeaponType::Plasma => dino_y + 15.0,
            WeaponType::Shotgun => dino_y + 25.0,
        };

        Some(Projectile::new(dino_x + 40.0, projectile_y, self.weapon_type))
    }

    pub fn update(&mut self, dt: f32) {
        self.cooldown_timer = (self.cooldown_timer - dt).max(0.0);
    }

    pub fn cooldown_progress(&self) -> f32 {
        if self.weapon_type.cooldown() > 0.0 {
            1.0 - (self.cooldown_timer / self.weapon_type.cooldown())
        } else {
            1.0
        }
    }
}
