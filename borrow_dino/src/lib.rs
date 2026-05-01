// Library entry point - exposes public API for main.rs (native) and wasm_bindgen (WASM)

mod background;
mod biome;
mod entities;
mod evolution;
mod game;

pub use game::{Game, GameState};
use macroquad::prelude::*;

/// Main game loop - called from main.rs (native) or wasm_bindgen start (WASM)
/// Note: For native builds, this is called from the #[macroquad::main] entry point in main.rs
/// For WASM builds, wasm_bindgen calls this directly
pub async fn main_macroquad() {
    let mut game = Game::new(1024.0, 600.0);

    loop {
        clear_background(BLACK);

        match game.state {
            GameState::Menu => {
                game.draw_menu();
                if is_key_pressed(KeyCode::Space) {
                    game.reset();
                    game.state = GameState::Playing;
                }
            }
            GameState::Playing => {
                game.handle_input();
                game.update(get_frame_time());
                game.draw();
            }
            GameState::GameOver => {
                game.draw();
                game.draw_game_over();
                if is_key_pressed(KeyCode::Space) {
                    game.reset();
                    game.state = GameState::Playing;
                }
            }
            GameState::Paused => {
                game.draw();
                game.draw_pause();
                if is_key_pressed(KeyCode::Escape) {
                    game.state = GameState::Playing;
                }
            }
        }

        next_frame().await;
    }
}
