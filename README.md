# 12 Pieces - Strategic African Board Game

A sophisticated implementation of a traditional African strategy game, featuring an advanced AI opponent powered by iterative deepening minimax search with tactical evaluation.

## Game Overview

12 Pieces is a captivating turn-based strategy game with roots in African traditional board games. Players must balance tactical captures with strategic positioning to outmaneuver their opponents.

![12 Pieces Game Demo](12_pions.mov)

## Game Rules

### Setup
- Played on a 5×5 board
- Each player starts with 12 pieces arranged on opposite sides
- Player 1 (bottom) moves first, aiming to reach the top row
- Player 2 (top/AI) moves second, aiming to reach the bottom row

### Core Mechanics
1. **Movement**
   - Regular pieces move one space orthogonally (forward, left, right)
   - Kings can slide any number of spaces orthogonally (like a rook in chess)
   - Kings can jump over friendly pieces

2. **Capturing**
   - Pieces capture by jumping over opponent pieces onto an empty space
   - **All captures are mandatory** - you must capture when possible
   - Multiple captures in sequence are required when available
   - Captured pieces are removed from the board

3. **Promotion**
   - Regular pieces are promoted to kings upon reaching the opposite end of the board
   - Kings have enhanced movement and capture abilities

4. **Victory Conditions**
   - Capture all opponent pieces
   - Block opponent so they have no legal moves
   - A draw occurs when both players have only one king each

## AI Intelligence

The game features a sophisticated AI opponent with:

- **Iterative Deepening Search**: Continuously searches deeper while time allows
- **Tactical Evaluation**: Enhanced evaluation of board positions focusing on:
  - Material advantage (pieces and kings)
  - King safety
  - Promotion potential
  - Sequential capture opportunities
  - Mobility and control
- **Quiescence Search**: Extends search in tactical positions to avoid horizon effect
- **Alpha-Beta Pruning**: Efficiently explores the most promising moves
- **Dynamic Time Management**: Adjusts search depth based on available time

## Technical Features

- 🎮 Single-player mode against the advanced AI
- 👥 Two-player mode for local multiplayer
- 👑 Smart piece promotion system
- 🔄 Chain capture detection and enforcement
- 🎯 Mandatory capture highlighting
- 💫 Responsive and intuitive UI

## Tech Stack

- **Next.js 14**: React framework for modern web applications
- **TypeScript**: Type-safe code development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality UI components
- **Socket.io**: Real-time communication for multiplayer

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
- Click a valid destination square to move
- Green highlights indicate valid moves
- Red highlights show mandatory captures
- The AI will automatically make its move after you complete yours

## How to Play Strategically

- **Material Balance**: Each regular piece is worth 100 points, kings are worth 300
- **Control the Center**: Pieces in the center have more mobility
- **Plan for Promotions**: Getting kings early gives you a significant advantage
- **Look for Multi-Captures**: Chain captures can quickly turn the game in your favor
- **King Safety**: Protect your kings as they are your most valuable pieces

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request to enhance the game or fix issues.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by traditional African strategy board games
- AI implementation based on advanced game theory algorithms
- UI components from Shadcn/ui
