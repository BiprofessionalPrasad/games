//! Rolling Ball 2D Platformer (Red Ball 4 style)
//!
//! A 2D side-scroller using Bevy + Rapier3D (gameplay locked to X-Y plane).
//! - Left/Right (A/D or arrows) to roll the red ball horizontally
//! - Space to jump (only when grounded)
//! - Collect gold spheres for points
//! - Avoid red patrolling enemies
//! - Jump gaps and avoid obstacles
//! - Reach the green goal at the end of the level
//!
//! Features lives, score, game over / level complete, and R to restart.
//! Orthographic side-view camera that follows the ball.

use bevy::prelude::*;
use bevy::render::camera::{OrthographicProjection, Projection, ScalingMode};
use bevy_rapier3d::prelude::*;

// Constants for game physics and controls
const BALL_RADIUS: f32 = 0.5;
const BALL_MASS: f32 = 1.0;
const MOVEMENT_FORCE: f32 = 18.0;
const JUMP_IMPULSE: f32 = 7.5;
// (Unused after switching to 2D side-scroller - kept for reference)
const _CAMERA_HEIGHT: f32 = 6.0;
const _CAMERA_DISTANCE: f32 = 9.0;
const _GROUND_SIZE: f32 = 50.0;
const _GROUND_THICKNESS: f32 = 0.5;

// Game constants
const COLLECTIBLE_RADIUS: f32 = 0.28;
const COLLECTIBLE_VALUE: u32 = 10;
const MAX_LIVES: u32 = 3;
const FALL_Y: f32 = -8.0;

/// Main entry point for the game
fn main() {
    App::new()
        // Add Bevy's default plugins (fix WindowPlugin for bevy 0.14)
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "Rolling Ball".into(),
                ..default()
            }),
            ..default()
        }))
        // Add Rapier 3D physics plugin
        .add_plugins(RapierPhysicsPlugin::<NoUserData>::default())
        // Game setup and runtime systems
        .add_systems(Startup, (setup_world, setup_lighting, setup_ui))
        .add_systems(
            Update,
            (
                handle_player_movement,
                update_camera,
                handle_collisions,
                update_ui,
                update_enemies,
                check_falling,
                handle_game_reset,
            ),
        )
        .insert_resource(GameState {
            score: 0,
            lives: MAX_LIVES,
            game_over: false,
            level_complete: false,
        })
        .run();
}

/// Marker for the player ball
#[derive(Component)]
struct Player;

/// Marker for the following camera
#[derive(Component)]
struct FollowCamera;

/// Marker for collectible coins
#[derive(Component)]
struct Collectible;

/// Marker for the win goal
#[derive(Component)]
struct Goal;

/// Enemy patrol data
#[derive(Component)]
struct Enemy {
    speed: f32,
    direction: Vec3,
    origin: Vec3,
    range: f32,
}

/// Game progress resource
#[derive(Resource)]
struct GameState {
    score: u32,
    lives: u32,
    game_over: bool,
    level_complete: bool,
}

/// UI marker components
#[derive(Component)]
struct ScoreText;
#[derive(Component)]
struct LivesText;
#[derive(Component)]
struct StatusText;

/// Sets up the game as a 2D side-scroller platformer (Red Ball 4 style).
/// Level is laid out along the X axis. Player + physics locked to the X-Y plane.
/// Orthographic camera provides a clean side view.
fn setup_world(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    // --- Base ground (long platform) ---
    // Long starting ground
    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Cuboid::new(22.0, 1.0, 8.0)),
            material: materials.add(Color::srgb(0.2, 0.45, 0.2)),
            transform: Transform::from_xyz(-6.0, -0.5, 0.0),
            ..default()
        },
        RigidBody::Fixed,
        Collider::cuboid(11.0, 0.5, 4.0),
    ));

    // Platform 2 (after small gap)
    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Cuboid::new(8.0, 1.0, 8.0)),
            material: materials.add(Color::srgb(0.2, 0.45, 0.2)),
            transform: Transform::from_xyz(8.0, -0.5, 0.0),
            ..default()
        },
        RigidBody::Fixed,
        Collider::cuboid(4.0, 0.5, 4.0),
    ));

    // Platform 3 (higher, requires jump)
    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Cuboid::new(7.0, 1.0, 8.0)),
            material: materials.add(Color::srgb(0.25, 0.48, 0.25)),
            transform: Transform::from_xyz(17.0, 1.2, 0.0),
            ..default()
        },
        RigidBody::Fixed,
        Collider::cuboid(3.5, 0.5, 4.0),
    ));

    // Platform 4 (after gap)
    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Cuboid::new(10.0, 1.0, 8.0)),
            material: materials.add(Color::srgb(0.2, 0.45, 0.2)),
            transform: Transform::from_xyz(27.0, -0.5, 0.0),
            ..default()
        },
        RigidBody::Fixed,
        Collider::cuboid(5.0, 0.5, 4.0),
    ));

    // Final platform / goal area (bigger gap before it)
    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Cuboid::new(12.0, 1.0, 8.0)),
            material: materials.add(Color::srgb(0.2, 0.45, 0.2)),
            transform: Transform::from_xyz(42.0, -0.5, 0.0),
            ..default()
        },
        RigidBody::Fixed,
        Collider::cuboid(6.0, 0.5, 4.0),
    ));

    // --- Some obstacles / boxes (you can roll under or jump over) ---
    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Cuboid::new(2.0, 2.0, 6.0)),
            material: materials.add(Color::srgb(0.6, 0.25, 0.25)),
            transform: Transform::from_xyz(4.0, 1.0, 0.0),
            ..default()
        },
        RigidBody::Fixed,
        Collider::cuboid(1.0, 1.0, 3.0),
    ));

    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Cuboid::new(2.0, 2.5, 6.0)),
            material: materials.add(Color::srgb(0.6, 0.25, 0.25)),
            transform: Transform::from_xyz(13.5, 1.25, 0.0),
            ..default()
        },
        RigidBody::Fixed,
        Collider::cuboid(1.0, 1.25, 3.0),
    ));

    // --- Dynamic crate (fun to push around) ---
    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Cuboid::new(1.2, 1.2, 4.0)),
            material: materials.add(Color::srgb(0.75, 0.55, 0.35)),
            transform: Transform::from_xyz(10.5, 0.6, 0.0),
            ..default()
        },
        RigidBody::Dynamic,
        Collider::cuboid(0.6, 0.6, 2.0),
        AdditionalMassProperties::Mass(0.7),
    ));

    // Spawn collectibles
    spawn_collectibles(&mut commands, &mut meshes, &mut materials);

    // Goal (green platform at the end)
    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Cuboid::new(3.5, 0.4, 6.0)),
            material: materials.add(Color::srgb(0.15, 0.7, 0.2)),
            transform: Transform::from_xyz(47.0, 0.2, 0.0),
            ..default()
        },
        RigidBody::Fixed,
        Collider::cuboid(1.75, 0.2, 3.0),
        ActiveEvents::COLLISION_EVENTS,
        Goal,
    ));

    // --- Enemies that patrol back and forth ---
    let enemy_spawns = [
        (6.5, 0.65, Vec3::X, 2.8),   // on first area
        (20.0, 1.85, Vec3::X, 2.2),  // on the high platform
        (30.5, 0.65, -Vec3::X, 3.5), // on the long platform before big gap
    ];
    for (x, y, dir, range) in enemy_spawns.iter() {
        let origin = Vec3::new(*x, *y, 0.0);
        commands.spawn((
            PbrBundle {
                mesh: meshes.add(Sphere::new(0.38)),
                material: materials.add(Color::srgb(0.85, 0.1, 0.1)),
                transform: Transform::from_translation(origin),
                ..default()
            },
            RigidBody::KinematicVelocityBased,
            Collider::ball(0.38),
            ActiveEvents::COLLISION_EVENTS,
            Velocity::default(),
            Enemy {
                speed: 2.6,
                direction: *dir,
                origin,
                range: *range,
            },
        ));
    }

    // The player ball (classic red for Red Ball feel)
    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Sphere::new(BALL_RADIUS)),
            material: materials.add(Color::srgb(0.9, 0.15, 0.1)),
            transform: Transform::from_xyz(-8.0, BALL_RADIUS + 0.2, 0.0),
            ..default()
        },
        RigidBody::Dynamic,
        Collider::ball(BALL_RADIUS),
        ExternalForce::default(),
        ExternalImpulse::default(),
        Velocity::default(),
        AdditionalMassProperties::Mass(BALL_MASS),
        // Keep the ball in the 2D (X-Y) plane
        LockedAxes::TRANSLATION_LOCKED_Z,
        Player,
        ActiveEvents::COLLISION_EVENTS,
    ));

    // Orthographic side-view camera (2D platformer look, looking along -Z)
    commands.spawn((
        Camera3dBundle {
            projection: Projection::Orthographic(OrthographicProjection {
                scaling_mode: ScalingMode::FixedVertical(11.0),
                ..default()
            }),
            transform: Transform::from_xyz(-4.0, 4.5, 20.0)
                .looking_at(Vec3::new(-4.0, 4.5, 0.0), Vec3::Y),
            ..default()
        },
        FollowCamera,
    ));
}

/// Helper to (re)spawn the gold collectibles (2D side-scroller layout)
fn spawn_collectibles(
    commands: &mut Commands,
    meshes: &mut ResMut<Assets<Mesh>>,
    materials: &mut ResMut<Assets<StandardMaterial>>,
) {
    // Laid out along the X axis for the side-scroller
    let collectible_positions = [
        (-4.0, 1.4),
        (1.5, 2.2),
        (5.5, 1.3),
        (12.0, 2.8),
        (15.5, 2.0),
        (23.0, 1.3),
        (29.5, 2.5),
        (38.0, 1.4),
        (44.5, 1.8),
    ];
    for (x, y) in collectible_positions.iter() {
        commands.spawn((
            PbrBundle {
                mesh: meshes.add(Sphere::new(COLLECTIBLE_RADIUS)),
                material: materials.add(Color::srgb(1.0, 0.82, 0.0)),
                transform: Transform::from_xyz(*x, *y, 0.0),
                ..default()
            },
            RigidBody::Fixed,
            Collider::ball(COLLECTIBLE_RADIUS),
            Sensor,
            ActiveEvents::COLLISION_EVENTS,
            Collectible,
        ));
    }
}

/// Lighting: sun + ambient with shadows
fn setup_lighting(mut commands: Commands) {
    commands.spawn(DirectionalLightBundle {
        directional_light: DirectionalLight {
            illuminance: 6500.0,
            shadows_enabled: true,
            ..default()
        },
        transform: Transform::from_rotation(Quat::from_euler(
            EulerRot::XYZ,
            -0.6,
            0.7,
            0.0,
        )),
        ..default()
    });

    commands.insert_resource(AmbientLight {
        color: Color::srgb(0.95, 0.95, 1.0),
        brightness: 0.28,
    });
}

/// Basic UI: score (top-left), lives (top-right), status message (bottom)
fn setup_ui(mut commands: Commands) {
    // Score
    commands.spawn((
        TextBundle::from_section(
            "Score: 0",
            TextStyle {
                font_size: 28.0,
                color: Color::WHITE,
                ..default()
            },
        )
        .with_style(Style {
            position_type: PositionType::Absolute,
            top: Val::Px(10.0),
            left: Val::Px(12.0),
            ..default()
        }),
        ScoreText,
    ));

    // Lives
    commands.spawn((
        TextBundle::from_section(
            "Lives: 3",
            TextStyle {
                font_size: 28.0,
                color: Color::WHITE,
                ..default()
            },
        )
        .with_style(Style {
            position_type: PositionType::Absolute,
            top: Val::Px(10.0),
            right: Val::Px(12.0),
            ..default()
        }),
        LivesText,
    ));

    // Status / win/lose message
    commands.spawn((
        TextBundle::from_section(
            "",
            TextStyle {
                font_size: 36.0,
                color: Color::srgb(1.0, 0.85, 0.2),
                ..default()
            },
        )
        .with_style(Style {
            position_type: PositionType::Absolute,
            bottom: Val::Px(40.0),
            left: Val::Percent(35.0),
            ..default()
        }),
        StatusText,
    ));
}

/// Player control for 2D side-scroller (Red Ball style).
/// A/D or Left/Right arrows move on the X axis. Space to jump when grounded.
fn handle_player_movement(
    keyboard_input: Res<ButtonInput<KeyCode>>,
    mut player_query: Query<(&mut ExternalForce, &mut ExternalImpulse, &Transform, &mut Velocity, &Player)>,
    rapier_context: Res<RapierContext>,
    game_state: Res<GameState>,
) {
    if game_state.game_over || game_state.level_complete {
        return;
    }

    if let Ok((mut ext_force, mut ext_impulse, transform, mut velocity, _player)) = player_query.get_single_mut() {
        // Grounded check via ray (down from ball center)
        let ray_origin = transform.translation;
        let ray_dir = Vec3::new(0.0, -1.0, 0.0);
        let max_toi = BALL_RADIUS + 0.15;

        let is_grounded = rapier_context
            .cast_ray(
                ray_origin,
                ray_dir,
                max_toi,
                true,
                QueryFilter::default(),
            )
            .is_some();

        // Pure 2D horizontal controls (left = negative X, right = positive X)
        let mut move_force = Vec3::ZERO;
        if keyboard_input.pressed(KeyCode::KeyD) || keyboard_input.pressed(KeyCode::ArrowRight) {
            move_force.x += MOVEMENT_FORCE;
        }
        if keyboard_input.pressed(KeyCode::KeyA) || keyboard_input.pressed(KeyCode::ArrowLeft) {
            move_force.x -= MOVEMENT_FORCE;
        }

        ext_force.force = move_force;

        // Jump (only when grounded, impulse for instant velocity change)
        if (keyboard_input.just_pressed(KeyCode::Space) || keyboard_input.just_pressed(KeyCode::ShiftLeft))
            && is_grounded
        {
            ext_impulse.impulse = Vec3::new(0.0, JUMP_IMPULSE, 0.0);
            // small horizontal assist in the direction you're moving
            if move_force.x.abs() > 0.5 {
                ext_impulse.impulse.x += move_force.x.signum() * 1.2;
            }
        }

        // Light damping when almost stopped on ground
        if move_force.x.abs() < 0.1 && is_grounded {
            velocity.linvel.x *= 0.94;
            velocity.angvel *= 0.9;
        }
    }
}

/// 2D side-scroller camera follow (follows ball on X with a little lead, keeps Y reasonable, fixed Z depth for ortho side view).
fn update_camera(
    player_query: Query<&Transform, (With<Player>, Without<FollowCamera>)>,
    mut camera_query: Query<&mut Transform, (With<FollowCamera>, Without<Player>)>,
) {
    if let Ok(player_tf) = player_query.get_single() {
        if let Ok(mut cam_tf) = camera_query.get_single_mut() {
            // Follow mostly on X (with slight lead so you can see ahead), keep Y near the ball but not too low
            let target_x = player_tf.translation.x + 3.5;
            let target_y = (player_tf.translation.y + 2.5).max(3.0);

            cam_tf.translation.x = cam_tf.translation.x.lerp(target_x, 0.12);
            cam_tf.translation.y = cam_tf.translation.y.lerp(target_y, 0.08);
            cam_tf.translation.z = 22.0; // fixed "camera distance" on Z axis for side view

            // Keep camera orientation straight (looking toward -Z) for clean 2D side view
            cam_tf.rotation = Quat::IDENTITY;
        }
    }
}

/// Consolidated collision handler for collectibles, goal, and enemy damage
fn handle_collisions(
    mut commands: Commands,
    mut collision_events: EventReader<CollisionEvent>,
    player_q: Query<Entity, With<Player>>,
    collectible_q: Query<Entity, With<Collectible>>,
    goal_q: Query<Entity, With<Goal>>,
    enemy_q: Query<Entity, With<Enemy>>,
    mut game_state: ResMut<GameState>,
    mut player_tf_q: Query<&mut Transform, With<Player>>,
) {
    for event in collision_events.read() {
        if let CollisionEvent::Started(e1, e2, _) = event {
            let (a, b) = (*e1, *e2);
            let player_e = if player_q.contains(a) { Some(a) } else if player_q.contains(b) { Some(b) } else { None };

            if let Some(_p) = player_e {
                // Collectible?
                let other = if collectible_q.contains(a) { a } else if collectible_q.contains(b) { b } else { Entity::PLACEHOLDER };
                if collectible_q.contains(other) && !game_state.game_over && !game_state.level_complete {
                    commands.entity(other).despawn();
                    game_state.score += COLLECTIBLE_VALUE;
                }

                // Goal?
                let other = if goal_q.contains(a) { a } else if goal_q.contains(b) { b } else { Entity::PLACEHOLDER };
                if goal_q.contains(other) && !game_state.game_over && !game_state.level_complete {
                    game_state.level_complete = true;
                }

                // Enemy hit?
                let other = if enemy_q.contains(a) { a } else if enemy_q.contains(b) { b } else { Entity::PLACEHOLDER };
                if enemy_q.contains(other) && !game_state.game_over && !game_state.level_complete {
                    game_state.lives = game_state.lives.saturating_sub(1);
                    if game_state.lives == 0 {
                        game_state.game_over = true;
                    } else if let Ok(mut tf) = player_tf_q.get_single_mut() {
                        // quick respawn near start, zero motion via impulses next frame
                        tf.translation = Vec3::new(-1.5, BALL_RADIUS + 2.0, -1.5);
                    }
                }
            }
        }
    }
}

/// Update on-screen score / lives / win-lose text.
/// Uses ParamSet because multiple &mut Text queries on different marker components
/// would otherwise conflict (Bevy error B0001).
fn update_ui(
    game_state: Res<GameState>,
    mut text_queries: ParamSet<(
        Query<&mut Text, With<ScoreText>>,
        Query<&mut Text, With<LivesText>>,
        Query<&mut Text, With<StatusText>>,
    )>,
) {
    if let Ok(mut t) = text_queries.p0().get_single_mut() {
        t.sections[0].value = format!("Score: {}", game_state.score);
    }
    if let Ok(mut t) = text_queries.p1().get_single_mut() {
        t.sections[0].value = format!("Lives: {}", game_state.lives);
    }
    if let Ok(mut t) = text_queries.p2().get_single_mut() {
        if game_state.level_complete {
            t.sections[0].value = "LEVEL COMPLETE! Press R to restart".into();
            t.sections[0].style.color = Color::srgb(0.2, 0.95, 0.3);
        } else if game_state.game_over {
            t.sections[0].value = "GAME OVER! Press R to restart".into();
            t.sections[0].style.color = Color::srgb(0.95, 0.2, 0.2);
        } else {
            t.sections[0].value = String::new();
        }
    }
}

/// Move enemies along patrol paths (sinusoidal back-and-forth)
fn update_enemies(
    time: Res<Time>,
    mut enemies: Query<(&mut Transform, &mut Velocity, &Enemy)>,
) {
    let t = time.elapsed_seconds() * 1.1;
    for (mut tf, mut vel, enemy) in &mut enemies {
        let phase = (t * enemy.speed * 0.35).sin();
        let offset = phase * enemy.range;
        let target = enemy.origin + enemy.direction * offset;

        let delta = target - tf.translation;
        if delta.length() > 0.15 {
            vel.linvel = delta.normalize() * enemy.speed;
        } else {
            vel.linvel = Vec3::ZERO;
        }
        // keep on y
        if (tf.translation.y - enemy.origin.y).abs() > 0.1 {
            tf.translation.y = enemy.origin.y;
        }
    }
}

/// If ball falls below world, lose a life and respawn (or game over)
fn check_falling(
    mut player_q: Query<(&mut Transform, &mut Velocity, &mut ExternalForce, &mut ExternalImpulse), With<Player>>,
    mut game_state: ResMut<GameState>,
) {
    if game_state.game_over || game_state.level_complete {
        return;
    }
    if let Ok((mut tf, mut vel, mut f, mut imp)) = player_q.get_single_mut() {
        if tf.translation.y < FALL_Y {
            game_state.lives = game_state.lives.saturating_sub(1);
            if game_state.lives == 0 {
                game_state.game_over = true;
            } else {
                // respawn
                tf.translation = Vec3::new(0.0, BALL_RADIUS + 3.0, -2.0);
                vel.linvel = Vec3::ZERO;
                vel.angvel = Vec3::ZERO;
                f.force = Vec3::ZERO;
                f.torque = Vec3::ZERO;
                imp.impulse = Vec3::ZERO;
                imp.torque_impulse = Vec3::ZERO;
            }
        }
    }
}

/// Press R after game over or level complete to fully restart the run (score, lives, player, collectibles)
fn handle_game_reset(
    keyboard: Res<ButtonInput<KeyCode>>,
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
    mut game_state: ResMut<GameState>,
    mut player_q: Query<(&mut Transform, &mut Velocity, &mut ExternalForce, &mut ExternalImpulse), With<Player>>,
    collectibles: Query<Entity, With<Collectible>>,
) {
    if keyboard.just_pressed(KeyCode::KeyR) && (game_state.game_over || game_state.level_complete) {
        // Despawn any remaining collectibles then respawn fresh set
        for e in collectibles.iter() {
            commands.entity(e).despawn();
        }
        spawn_collectibles(&mut commands, &mut meshes, &mut materials);

        // Reset player to start with zeroed motion
        if let Ok((mut tf, mut vel, mut f, mut imp)) = player_q.get_single_mut() {
            tf.translation = Vec3::new(0.0, BALL_RADIUS + 0.2, 0.0);
            vel.linvel = Vec3::ZERO;
            vel.angvel = Vec3::ZERO;
            f.force = Vec3::ZERO;
            f.torque = Vec3::ZERO;
            imp.impulse = Vec3::ZERO;
            imp.torque_impulse = Vec3::ZERO;
        }

        // Reset progress
        game_state.score = 0;
        game_state.lives = MAX_LIVES;
        game_state.game_over = false;
        game_state.level_complete = false;
    }
}
