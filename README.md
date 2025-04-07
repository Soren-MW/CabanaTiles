# CabanaTiles

**Play Now:** [cabanatiles.netlify.app](https://cabanatiles.netlify.app)

**CabanaTiles** is a letter-based game in which players compete against time, challenging themselves to utilize all their tiles by spelling out valid, connected English words in a changing board. The game starts with a set of 21 randomly drawn tiles. Players drag and drop these tiles together in a strip of connected words, similar to a crossword. The layout is intended for desktop or mouse and keyboard players.

Once all tiles from the rack are used up in legal words, a "boogie" is initiated—adding a new tile from the shared pool. When players find themselves stuck in a situation with a difficult letter, a "shakeup" can be done by right-clicking a tile, which exchanges the unwanted tile for three new random tiles. The game is over when the pool of tiles is depleted and all tiles are properly placed in a connected arrangement of legal words. A multiplayer version is in the pipeline!

---

## Features

- Drag-and-drop tile mechanics using React DnD
- Real-time word validation using local Collins Scrabble Words / SOWPODS file
- "Shakeup" mechanic: exchange a single tile for three random new ones
- "Boogie" mechanic: place all rack tiles in valid, connected words to receive one new tile
- Visual feedback for valid vs. invalid tile placement
- Responsive layout that dynamically resizes the game board
- Midcentury modern Inspired theme

---

## Tech Stack

- React
- React DnD
- Tailwind CSS
- JavaScript ES6
- Vite
- Framer Motion

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/Soren-MW/CabanaTiles.git
cd CabanaTiles
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Open the app in your browser

```
http://localhost:5173
```

---

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).

---

### Status

CabanaTiles is currently in active development.

- Multiplayer support
- Lobby creation and username system w/ WebSockets
- Tile animations and polish
- Public web app deployment

A playable version is live, improvements and additions are ongoing.
