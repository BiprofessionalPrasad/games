import puzzles from '../data/puzzles.json';
import type { Puzzle } from '../types';

export class PuzzleManager {
  private static allPuzzles: Puzzle[] = puzzles as Puzzle[];
  private static playedPuzzles: Set<string> = new Set();

  static getRandomPuzzle(): Puzzle {
    if (this.playedPuzzles.size === this.allPuzzles.length) {
      this.playedPuzzles.clear();
    }

    const availablePuzzles = this.allPuzzles.filter(
      (p) => !this.playedPuzzles.has(p.PuzzleId)
    );

    const randomIndex = Math.floor(Math.random() * availablePuzzles.length);
    const selectedPuzzle = availablePuzzles[randomIndex];
    this.playedPuzzles.add(selectedPuzzle.PuzzleId);

    return selectedPuzzle;
  }
}
