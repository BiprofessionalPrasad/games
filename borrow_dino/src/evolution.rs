/// Evolution stages that unlock new abilities
#[derive(Clone, Copy, PartialEq)]
pub enum EvolutionStage {
    Base,       // Starting form - no special abilities
    Winged,     // Can glide and has reduced borrow drain while airborne
    Armored,    // Can tank one hit without game over
    Swift,      // Can double jump (two borrows instead of one)
    Ultimate,   // All abilities combined
}

impl EvolutionStage {
    pub fn name(&self) -> &'static str {
        match self {
            EvolutionStage::Base => "BASE",
            EvolutionStage::Winged => "WINGED",
            EvolutionStage::Armored => "ARMORED",
            EvolutionStage::Swift => "SWIFT",
            EvolutionStage::Ultimate => "ULTIMATE",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            EvolutionStage::Base => "Basic dino form",
            EvolutionStage::Winged => "Hold SPACE to glide, reduced borrow drain",
            EvolutionStage::Armored => "Absorbs one hit, golden shield activates",
            EvolutionStage::Swift => "Double jump ability unlocked",
            EvolutionStage::Ultimate => "All powers combined - peak predator",
        }
    }
}

/// Individual abilities that can be unlocked
#[derive(Clone)]
pub enum Ability {
    Glide,      // Hold jump to glide (slower fall)
    Armor,      // One-time damage absorption
    DoubleJump, // Second mid-air jump
}

/// Evolution manager tracking progress and abilities
pub struct Evolution {
    pub stage: EvolutionStage,
    pub abilities: Vec<Ability>,
    pub next_threshold: u32,
    pub last_evolution_score: u32,
    pub evolution_flash_timer: f32,
}

impl Evolution {
    pub const EVOLUTION_INTERVAL: u32 = 500; // Points between evolutions

    pub fn new() -> Self {
        Self {
            stage: EvolutionStage::Base,
            abilities: Vec::new(),
            next_threshold: Self::EVOLUTION_INTERVAL,
            last_evolution_score: 0,
            evolution_flash_timer: 0.0,
        }
    }

    /// Check if dino should evolve based on score
    /// Returns true if evolution occurred
    pub fn check_evolve(&mut self, score: u32) -> bool {
        if score >= self.next_threshold && self.stage != EvolutionStage::Ultimate {
            self.advance_stage();
            self.evolution_flash_timer = 2.0; // 2 second flash
            return true;
        }

        if self.evolution_flash_timer > 0.0 {
            self.evolution_flash_timer -= 0.016; // Approx 60fps
        }

        false
    }

    fn advance_stage(&mut self) {
        self.stage = match self.stage {
            EvolutionStage::Base => EvolutionStage::Winged,
            EvolutionStage::Winged => EvolutionStage::Armored,
            EvolutionStage::Armored => EvolutionStage::Swift,
            EvolutionStage::Swift => EvolutionStage::Ultimate,
            EvolutionStage::Ultimate => EvolutionStage::Ultimate,
        };

        // Grant ability based on new stage
        let ability = match self.stage {
            EvolutionStage::Winged => Ability::Glide,
            EvolutionStage::Armored => Ability::Armor,
            EvolutionStage::Swift => Ability::DoubleJump,
            EvolutionStage::Ultimate => Ability::Glide, // Already has all
            EvolutionStage::Base => Ability::Glide,     // Shouldn't happen
        };

        self.abilities.push(ability);
        self.next_threshold += Self::EVOLUTION_INTERVAL;
    }

    pub fn has_glide(&self) -> bool {
        self.stage as u8 >= EvolutionStage::Winged as u8
    }

    pub fn has_armor(&self) -> bool {
        self.stage as u8 >= EvolutionStage::Armored as u8
    }

    pub fn has_double_jump(&self) -> bool {
        self.stage as u8 >= EvolutionStage::Swift as u8
    }

    pub fn is_flashing(&self) -> bool {
        self.evolution_flash_timer > 0.0
    }

    pub fn flash_alpha(&self) -> f32 {
        if self.is_flashing() {
            (self.evolution_flash_timer / 2.0).min(1.0)
        } else {
            0.0
        }
    }

    /// Returns borrow drain multiplier based on evolution
    /// Winged and Ultimate have reduced drain
    pub fn borrow_drain_multiplier(&self) -> f32 {
        match self.stage {
            EvolutionStage::Winged | EvolutionStage::Ultimate => 0.5,
            _ => 1.0,
        }
    }

    /// Returns max jumps based on evolution
    pub fn max_jumps(&self) -> u32 {
        match self.stage {
            EvolutionStage::Swift | EvolutionStage::Ultimate => 2,
            _ => 1,
        }
    }
}
