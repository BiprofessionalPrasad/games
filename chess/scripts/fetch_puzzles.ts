import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://datasets-server.huggingface.co/rows?dataset=Lichess/chess-puzzles&config=default&split=train&offset=0&length=1000';
const OUTPUT_PATH = path.join(__dirname, '../src/data/puzzles.json');

async function fetchPuzzles() {
  try {
    console.log('Fetching puzzles from Hugging Face in batches...');
    let allPuzzles: any[] = [];
    const BATCH_SIZE = 100;
    const TOTAL_PUZZLES = 1000;

    for (let offset = 0; offset < TOTAL_PUZZLES; offset += BATCH_SIZE) {
      console.log(`Fetching ${offset} to ${offset + BATCH_SIZE}...`);
      const url = `https://datasets-server.huggingface.co/rows?dataset=Lichess/chess-puzzles&config=default&split=train&offset=${offset}&length=${BATCH_SIZE}`;
      const response = await axios.get(url);
      const rows = response.data.rows;

      const puzzles = rows.map((row: any) => ({
        PuzzleId: row.row.PuzzleId,
        FEN: row.row.FEN,
        Moves: row.row.Moves,
        Rating: row.row.Rating,
        Themes: row.row.Themes,
      }));

      allPuzzles = [...allPuzzles, ...puzzles];
    }

    const dataDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allPuzzles, null, 2));
    console.log(`Successfully saved ${allPuzzles.length} puzzles to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    process.exit(1);
  }
}

fetchPuzzles();
