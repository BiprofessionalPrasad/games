use macroquad::prelude::*;
use crate::biome::BiomeType;

/// Single sprite in a parallax layer
pub struct ParallaxSprite {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub color: Color,
}

impl ParallaxSprite {
    pub fn draw(&self) {
        draw_rectangle(self.x, self.y, self.width, self.height, self.color);
    }
}

/// A scrolling layer with multiple sprites
pub struct ParallaxLayer {
    pub sprites: Vec<ParallaxSprite>,
    pub scroll_speed: f32,
    pub repeat_width: f32,
    pub base_y: f32,
}

impl ParallaxLayer {
    pub fn new(scroll_speed: f32, repeat_width: f32, base_y: f32) -> Self {
        Self {
            sprites: Vec::new(),
            scroll_speed,
            repeat_width,
            base_y,
        }
    }

    pub fn scroll(&mut self, delta: f32) {
        for sprite in &mut self.sprites {
            sprite.x -= delta;
            // Wrap around when sprite goes off screen
            if sprite.x + sprite.width < 0.0 {
                sprite.x += self.repeat_width * 2.0;
            }
        }
    }

    pub fn draw(&self) {
        for sprite in &self.sprites {
            sprite.draw();
        }
    }

    pub fn regenerate(&mut self, biome: BiomeType, screen_width: f32) {
        self.sprites.clear();
        let colors = biome.layer_colors();

        // Generate sprites across the screen width
        let mut x = 0.0;
        while x < screen_width * 2.0 {
            let sprite = ParallaxSprite {
                x,
                y: self.base_y,
                width: 100.0 + rand::gen_range(50.0, 150.0),
                height: 80.0 + rand::gen_range(20.0, 100.0),
                color: colors[rand::gen_range(0, colors.len())],
            };
            self.sprites.push(sprite);
            x += self.repeat_width;
        }
    }
}

/// Complete background with three parallax layers
pub struct Background {
    pub clouds: ParallaxLayer,
    pub mountains: ParallaxLayer,
    pub ground: ParallaxLayer,
    pub current_biome: BiomeType,
}

impl Background {
    pub fn new(screen_width: f32, screen_height: f32) -> Self {
        let mut background = Self {
            clouds: ParallaxLayer::new(0.1, 200.0, screen_height * 0.1),
            mountains: ParallaxLayer::new(0.3, 150.0, screen_height * 0.4),
            ground: ParallaxLayer::new(1.0, 100.0, screen_height * 0.75),
            current_biome: BiomeType::Desert,
        };

        background.clouds.regenerate(BiomeType::Desert, screen_width);
        background.mountains.regenerate(BiomeType::Desert, screen_width);
        background.ground.regenerate(BiomeType::Desert, screen_width);

        background
    }

    pub fn update(&mut self, game_speed: f32, dt: f32) {
        self.clouds.scroll(game_speed * self.clouds.scroll_speed * dt);
        self.mountains.scroll(game_speed * self.mountains.scroll_speed * dt);
        self.ground.scroll(game_speed * self.ground.scroll_speed * dt);
    }

    pub fn draw(&self) {
        // Draw back to front: clouds -> mountains -> ground
        self.clouds.draw();
        self.mountains.draw();
        self.ground.draw();
    }

    pub fn set_biome(&mut self, biome: BiomeType, screen_width: f32) {
        self.current_biome = biome;
        self.clouds.regenerate(biome, screen_width);
        self.mountains.regenerate(biome, screen_width);
        self.ground.regenerate(biome, screen_width);
    }
}
