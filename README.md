# 12 Pieces - African Board Game

A modern implementation of a traditional African board game, built with Next.js and TypeScript. This game features an AI opponent using the minimax algorithm with alpha-beta pruning.

![12 Pieces Game Demo](12_pions.mov)

## Game Rules

### Setup
- Played on a 5x5 board
- Each player starts with 12 pieces
- Pieces move orthogonally (up, down, left, right)

### Basic Rules
1. **Movement**
   - Regular pieces move one space orthogonally
   - Kings can slide multiple spaces orthogonally
   - Kings can jump over friendly pieces

2. **Captures**
   - Pieces capture by jumping over opponent pieces
   - Captures are mandatory
   - Multiple captures in one turn are required when possible
   - The captured piece is removed from the board

3. **Kings**
   - Regular pieces become kings when reaching the opposite end
   - Kings have enhanced movement capabilities
   - Kings can make long-range captures

4. **Winning**
   - Capture all opponent pieces to win
   - Game is drawn when both players have only one king each

## Features

- 🎮 Play against AI or another human player
- 👑 Smart piece promotion system
- 🤖 Advanced AI using minimax algorithm
- 🎯 Mandatory capture enforcement
- 🔄 Chain capture detection
- 💫 Modern, responsive UI

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Linzo99/12_pions.git
   cd 12_pions
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```

4. **Open the game**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Game Controls

- Click to select a piece
- Click again on a valid square to move
- Green highlights show valid moves
- Red highlights show mandatory captures
- Use the settings menu to:
  - Toggle AI opponent
  - Adjust game rules

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by traditional African board games
- AI implementation based on advanced minimax algorithm with alpha-beta pruning
- UI components from Shadcn/ui
