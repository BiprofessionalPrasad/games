use macroquad::prelude::*;

mod game;
mod entities;
mod maze;

use game::{Game, GameState};

fn window_conf() -> Conf {
    Conf {
        window_title: "Zombie Pac-Man".to_owned(),
        window_width: 800,
        window_height: 600,
        window_resizable: false,
        ..Default::default()
    }
}

#[macroquad::main(window_conf)]
async fn main() {
    let mut game = Game::new();

    loop {
        // Clear screen with dark background
        clear_background(Color::new(0.1, 0.1, 0.15, 1.0));

        match game.state {
            GameState::Menu => {
                // Draw menu
                draw_menu(&mut game);

                // Check for start input
                if is_key_pressed(KeyCode::Enter) || is_mouse_button_pressed(MouseButton::Left) {
                    game.state = GameState::Playing;
                }
            }
            GameState::Playing => {
                // Handle input
                if is_key_down(KeyCode::W) || is_key_down(KeyCode::Up) {
                    game.player.set_direction(Vec2::new(0.0, -1.0));
                } else if is_key_down(KeyCode::S) || is_key_down(KeyCode::Down) {
                    game.player.set_direction(Vec2::new(0.0, 1.0));
                } else if is_key_down(KeyCode::A) || is_key_down(KeyCode::Left) {
                    game.player.set_direction(Vec2::new(-1.0, 0.0));
                } else if is_key_down(KeyCode::D) || is_key_down(KeyCode::Right) {
                    game.player.set_direction(Vec2::new(1.0, 0.0));
                }

                game.update();
                game.draw();

                if game.game_over {
                    game.state = GameState::GameOver;
                }
            }
            GameState::GameOver => {
                draw_game_over(&game);

                // Check for restart input
                if is_key_pressed(KeyCode::Enter) || is_mouse_button_pressed(MouseButton::Left) {
                    game = Game::new();
                }
            }
        }

        next_frame().await;
    }
}

fn draw_menu(game: &mut Game) {
    let title = "ZOMBIE PAC-MAN";
    let title_size = 60.0;
    let title_width = measure_text(title, None, title_size as u16, 1.0).width;

    // Title with glow effect
    draw_text_ex(
        title,
        (800.0 - title_width) / 2.0,
        150.0,
        TextParams {
            font_size: title_size as u16,
            color: Color::new(0.2, 0.8, 0.2, 1.0),
            ..Default::default()
        },
    );

    // Subtitle
    let subtitle = "Survive the Zombie Maze";
    let subtitle_width = measure_text(subtitle, None, 24, 1.0).width;
    draw_text(
        subtitle,
        (800.0 - subtitle_width) / 2.0,
        200.0,
        24.0,
        Color::new(0.7, 0.7, 0.7, 1.0),
    );

    // Instructions
    let instructions = [
        "WASD or Arrow Keys - Move",
        "Collect food pellets (+10 points)",
        "Avoid the zombies!",
        "Power pills let you eliminate zombies",
    ];

    for (i, line) in instructions.iter().enumerate() {
        let line_width = measure_text(line, None, 20, 1.0).width;
        draw_text(
            line,
            (800.0 - line_width) / 2.0,
            280.0 + (i as f32 * 35.0),
            20.0,
            Color::new(0.8, 0.8, 0.8, 1.0),
        );
    }

    // Start prompt with pulsing effect
    let pulse = (game.menu_timer.sin() + 1.0) / 2.0;
    let start_text = "Press ENTER or CLICK to Start";
    let start_width = measure_text(start_text, None, 28, 1.0).width;
    let alpha = 0.5 + pulse * 0.5;
    draw_text(
        start_text,
        (800.0 - start_width) / 2.0,
        450.0,
        28.0,
        Color::new(1.0, 1.0, 0.0, alpha),
    );

    game.menu_timer += get_frame_time();
}

fn draw_game_over(game: &Game) {
    // Dark overlay
    draw_rectangle(0.0, 0.0, 800.0, 600.0, Color::new(0.0, 0.0, 0.0, 0.7));

    let title = if game.won { "YOU SURVIVED!" } else { "GAME OVER" };
    let title_color = if game.won {
        Color::new(0.2, 1.0, 0.2, 1.0)
    } else {
        Color::new(1.0, 0.2, 0.2, 1.0)
    };

    let title_width = measure_text(title, None, 56, 1.0).width;
    draw_text(
        title,
        (800.0 - title_width) / 2.0,
        200.0,
        56.0,
        title_color,
    );

    // Score
    let score_text = format!("Final Score: {}", game.score);
    let score_width = measure_text(&score_text, None, 32, 1.0).width;
    draw_text(
        &score_text,
        (800.0 - score_width) / 2.0,
        280.0,
        32.0,
        Color::new(1.0, 1.0, 1.0, 1.0),
    );

    // Restart prompt
    let restart_text = "Press ENTER or CLICK to Restart";
    let restart_width = measure_text(restart_text, None, 24, 1.0).width;
    draw_text(
        restart_text,
        (800.0 - restart_width) / 2.0,
        380.0,
        24.0,
        Color::new(0.8, 0.8, 0.8, 1.0),
    );
}
