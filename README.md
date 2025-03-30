# CabanaTiles

**CabanaTiles** is an in-progress drag-and-drop word game built in React where players build interconnected strings of words using digital tiles in a competitive format.

---

## Features

- Drag-and-drop tile mechanics using React DnD
- Real-time word validation using local SOWPOD json file
- "Spin" mechanic: exchange a single tile for three random new ones
- "Boogie" mechanic: place all rack tiles in valid, connected words to receive one new tile
- Visual feedback for valid vs. invalid tile placement
- Responsive layout that dynamically resizes the game board
- Midcentury Modern Inspired theme

---

## Tech Stack

- React
- React DnD
- Tailwind CSS
- JavaScript (ES6+)
- Dictionary API
- Vite (for development server and bundling)

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

## Project Structure

```
CabanaTiles/
├── public/                 # Static assets (images, sounds)
├── src/
│   ├── components/
│   │   ├── BoardCell.jsx
│   │   ├── GameBoard.jsx
│   │   ├── SpinZone.jsx
│   │   ├── Tile.jsx
│   │   └── TileRack.jsx
│   ├── App.jsx
│   └── index.jsx
├── package.json
├── tailwind.config.js
└── README.md
```

---

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).

---

### Status

CabanaTiles is currently in active development.

- Multiplayer support
- Lobby creation and nickname system
- Tile animations and polish
- Public web app deployment
- Performance improvements and testing

The main goal is to publish this as a playable browser-based web app. Contributions, ideas, or feedback of any nature is greatly appreciated!
