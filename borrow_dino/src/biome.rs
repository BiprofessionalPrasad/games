use macroquad::prelude::*;

/// Physics configuration for each biome
#[derive(Clone, Copy)]
pub struct PhysicsConfig {
    pub gravity: f32,
    pub jump_force: f32,
    pub friction: f32,
    pub acceleration: f32,
    pub max_speed: f32,
}

impl Default for PhysicsConfig {
    fn default() -> Self {
        Self {
            gravity: 800.0,
            jump_force: 450.0,
            friction: 0.85,
            acceleration: 0.5,
            max_speed: 400.0,
        }
    }
}

/// Elemental biome types
#[derive(Clone, Copy, PartialEq)]
pub enum BiomeType {
    Desert,    // Default physics
    Tundra,    // Slippery physics
    Cyberpunk, // Flipped gravity
    Forest,    // Higher jump, slower fall
}

impl BiomeType {
    pub fn physics_config(&self) -> PhysicsConfig {
        match self {
            BiomeType::Desert => PhysicsConfig::default(),
            BiomeType::Tundra => PhysicsConfig {
                friction: 0.95,
                acceleration: 0.3,
                max_speed: 350.0,
                ..Default::default()
            },
            BiomeType::Cyberpunk => PhysicsConfig {
                gravity: -500.0,
                jump_force: -400.0,
                ..Default::default()
            },
            BiomeType::Forest => PhysicsConfig {
                gravity: 300.0,
                jump_force: 550.0,
                ..Default::default()
            },
        }
    }

    pub fn background_color(&self) -> Color {
        match self {
            BiomeType::Desert => Color::new(0.9, 0.7, 0.4, 1.0),
            BiomeType::Tundra => Color::new(0.8, 0.9, 1.0, 1.0),
            BiomeType::Cyberpunk => Color::new(0.1, 0.0, 0.2, 1.0),
            BiomeType::Forest => Color::new(0.4, 0.7, 0.4, 1.0),
        }
    }

    pub fn layer_colors(&self) -> Vec<Color> {
        match self {
            BiomeType::Desert => vec![
                Color::new(0.8, 0.6, 0.3, 0.8),  // Clouds
                Color::new(0.7, 0.5, 0.2, 0.9),  // Mountains
                Color::new(0.6, 0.4, 0.1, 1.0),  // Ground
            ],
            BiomeType::Tundra => vec![
                Color::new(0.9, 0.95, 1.0, 0.8),
                Color::new(0.7, 0.85, 0.95, 0.9),
                Color::new(0.6, 0.8, 0.9, 1.0),
            ],
            BiomeType::Cyberpunk => vec![
                Color::new(0.5, 0.0, 0.8, 0.6),
                Color::new(0.8, 0.0, 0.6, 0.8),
                Color::new(0.2, 0.0, 0.4, 1.0),
            ],
            BiomeType::Forest => vec![
                Color::new(0.8, 0.9, 0.8, 0.7),
                Color::new(0.4, 0.7, 0.4, 0.85),
                Color::new(0.2, 0.5, 0.2, 1.0),
            ],
        }
    }

    pub fn next(&self) -> BiomeType {
        match self {
            BiomeType::Desert => BiomeType::Tundra,
            BiomeType::Tundra => BiomeType::Cyberpunk,
            BiomeType::Cyberpunk => BiomeType::Forest,
            BiomeType::Forest => BiomeType::Desert,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            BiomeType::Desert => "DESERT",
            BiomeType::Tundra => "TUNDRA",
            BiomeType::Cyberpunk => "CYBERPUNK",
            BiomeType::Forest => "FOREST",
        }
    }
}

/// Biome manager with transition logic
pub struct Biome {
    pub biome_type: BiomeType,
    pub transition_timer: f32,
    pub warning_timer: f32,
    pub transition_duration: f32,
    pub is_transitioning: bool,
}

impl Biome {
    pub const TRANSITION_INTERVAL: f32 = 10.0; // seconds between biome changes
    pub const WARNING_DURATION: f32 = 3.0;     // seconds of warning before transition

    pub fn new() -> Self {
        Self {
            biome_type: BiomeType::Desert,
            transition_timer: Self::TRANSITION_INTERVAL,
            warning_timer: 0.0,
            transition_duration: 0.0,
            is_transitioning: false,
        }
    }

    pub fn update(&mut self, dt: f32) {
        if self.is_transitioning {
            self.transition_duration -= dt;
            if self.transition_duration <= 0.0 {
                self.is_transitioning = false;
                self.transition_timer = Self::TRANSITION_INTERVAL;
            }
        } else {
            self.transition_timer -= dt;
            if self.transition_timer <= 0.0 {
                self.is_transitioning = true;
                self.transition_duration = 2.0; // 2 second smooth transition
                self.warning_timer = Self::WARNING_DURATION;
            }
        }

        if self.warning_timer > 0.0 {
            self.warning_timer -= dt;
        }
    }

    pub fn cycle(&mut self) {
        self.biome_type = self.biome_type.next();
    }

    pub fn physics(&self) -> PhysicsConfig {
        self.biome_type.physics_config()
    }

    pub fn should_warn(&self) -> bool {
        self.warning_timer > 0.0
    }

    pub fn transition_alpha(&self) -> f32 {
        if self.is_transitioning {
            1.0 - (self.transition_duration / 2.0)
        } else {
            0.0
        }
    }
}
