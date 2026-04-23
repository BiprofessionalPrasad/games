
pub struct Challenge {
    pub id: u32,
    pub description: String,
    pub code_snippet: String,
    pub correct_answer: String,
    pub hint: String,
}

pub struct GameState {
    pub current_challenge_index: usize,
    pub score: u32,
    pub health: i32,
}

impl GameState {
    pub fn new() -> Self {
        Self {
            current_challenge_index: 0,
            score: 0,
            health: 3,
        }
    }

    pub fn next_challenge(&mut self) {
        self.current_challenge_index += 1;
    }

    pub fn add_score(&mut self, points: u32) {
        self.score += points;
    }

    pub fn take_damage(&mut self) {
        self.health -= 1;
    }
}
