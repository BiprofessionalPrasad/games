mod game_logic;

use game_logic::{GameState, Challenge};
use std::io::{self, Write};

fn main() {
    println!("Welcome to The Borrow Checker's Dungeon!");
    println!("Solve the Rust puzzles to escape. Don't let your health hit 0!\n");

    let mut state = GameState::new();
    let challenges = get_initial_challenges();

    while state.current_challenge_index < challenges.len() && state.health > 0 {
        let challenge = &challenges[state.current_challenge_index];
        
        println!("--- Challenge {} ---", challenge.id);
        println!("{}\n", challenge.description);
        println!("Code:\n{}\n", challenge.code_snippet);
        print!("Your answer: ");
        io::stdout().flush().unwrap();

        let mut answer = String::new();
        io::stdin().read_line(&mut answer).expect("Failed to read line");
        let answer = answer.trim();

        if answer == challenge.correct_answer {
            println!("\nCorrect! You've unlocked the gate.\n");
            state.add_score(10);
            state.next_challenge();
        } else {
            println!("\nWrong! The compiler screams in agony. Hint: {}\n", challenge.hint);
            state.take_damage();
        }

        println!("Health: {} | Score: {}\n", state.health, state.score);
    }

    if state.health <= 0 {
        println!("Game Over! You were consumed by the Borrow Checker.");
    } else {
        println!("Congratulations! You've escaped the dungeon with a score of {}!", state.score);
    }
}

fn get_initial_challenges() -> Vec<Challenge> {
    vec![
        Challenge {
            id: 1,
            description: "What is the result of this code? (Print the value)".to_string(),
            code_snippet: "let x = 5; let y = x; println!(\"{}\", y);".to_string(),
            correct_answer: "5".to_string(),
            hint: "Integers implement the Copy trait.".to_string(),
        },
        Challenge {
            id: 2,
            description: "Will this code compile? (yes/no)".to_string(),
            code_snippet: "let s1 = String::from(\"hello\");\nlet s2 = s1;\nprintln!(\"{}\", s1);".to_string(),
            correct_answer: "no".to_string(),
            hint: "Think about ownership and moving values.".to_string(),
        },
        Challenge {
            id: 3,
            description: "What is the correct way to borrow a value immutably?".to_string(),
            code_snippet: "let s = String::from(\"hello\");\n// How to pass s to a function without losing ownership?\nfn calculate_length(s: ___) -> usize { s.len() }".to_string(),
            correct_answer: "&String".to_string(),
            hint: "Use a reference to borrow the value.".to_string(),
        },
        Challenge {
            id: 4,
            description: "Will this code compile? (yes/no)".to_string(),
            code_snippet: "let mut x = 5;\nlet y = &mut x;\nlet z = &mut x;\nprintln!(\"{}\", y);".to_string(),
            correct_answer: "no".to_string(),
            hint: "You cannot have two mutable references to the same value at the same time.".to_string(),
        },
        Challenge {
            id: 5,
            description: "Which keyword is used to define a trait in Rust?".to_string(),
            code_snippet: "___ Summary {\n    fn summarize(&self) -> String;\n}".to_string(),
            correct_answer: "trait".to_string(),
            hint: "It's the keyword used for shared behavior.".to_string(),
        },
    ]
}
