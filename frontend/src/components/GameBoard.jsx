import React, { useState, useEffect, useRef } from "react";
import BoardCell from "./BoardCell";

// Constant size of each square on the game board
const BOARD_SQUARE_WIDTH = 60;
const BOARD_SQUARE_HEIGHT = 60;
/**
 * GameBoard renders the dynamic grid environment for the game.
 * Handled within GameBoard are:
 * Layout resizing based on window dimensions
 * Word validity
 * Drop handling between the rack and board
 * "Boogie" Logic
 * Click-to-return events
 *
 */
const GameBoard = ({
    tiles,
    setTiles,
    rackTiles,
    onTilePlacedFromRack,
    onTileReturnToRack,
    onBoardTileSpun,
    processedTileIdsRef,
}) => {
    const wrapperRef = useRef(null);
    const [gridSizeX, setGridSizeX] = useState(10);
    const [gridSizeY, setGridSizeY] = useState(10);
    const [validWords, setValidWords] = useState(new Set());

    // Grid size calculation based on dimensions of window
    useEffect(() => {
        const updateGridSize = () => {
            if (wrapperRef.current) {
                const { width, height } =
                    wrapperRef.current.getBoundingClientRect();
                const cols = Math.floor(width / BOARD_SQUARE_WIDTH);
                const rows = Math.floor(height / BOARD_SQUARE_HEIGHT);
                if (cols > 0 && rows > 0) {
                    setGridSizeX(cols);
                    setGridSizeY(rows);
                }
            }
        };
        updateGridSize();
        window.addEventListener("resize", updateGridSize);
        return () => window.removeEventListener("resize", updateGridSize);
    }, []);
    // Set of valid 2-letter Scrabble words for local validation and minimizing API calls
    const twoLetterWords = new Set([
        "aa",
        "ab",
        "ad",
        "ae",
        "ag",
        "ah",
        "ai",
        "al",
        "am",
        "an",
        "ar",
        "as",
        "at",
        "aw",
        "ax",
        "ay",
        "ba",
        "be",
        "bi",
        "bo",
        "by",
        "da",
        "de",
        "do",
        "ed",
        "ef",
        "eh",
        "el",
        "em",
        "en",
        "er",
        "es",
        "et",
        "ex",
        "fa",
        "fe",
        "go",
        "ha",
        "he",
        "hi",
        "hm",
        "ho",
        "id",
        "if",
        "in",
        "is",
        "it",
        "jo",
        "ka",
        "ki",
        "la",
        "li",
        "lo",
        "ma",
        "me",
        "mi",
        "mm",
        "mo",
        "mu",
        "my",
        "na",
        "ne",
        "no",
        "nu",
        "od",
        "oe",
        "of",
        "oh",
        "oi",
        "ok",
        "om",
        "on",
        "op",
        "or",
        "os",
        "ow",
        "ox",
        "oy",
        "pa",
        "pe",
        "pi",
        "qi",
        "re",
        "sh",
        "si",
        "so",
        "ta",
        "te",
        "ti",
        "to",
        "uh",
        "um",
        "un",
        "up",
        "us",
        "ut",
        "we",
        "wo",
        "xi",
        "xu",
        "ya",
        "ye",
        "yo",
        "za",
    ]);
    // Validates a word by checking its length, characters, and existence in the dictionary API
    const isValidWord = async (word) => {
        if (!word || word.length < 2) return false;
        const cleanWord = word.toLowerCase();
        if (!/^[a-z]+$/.test(cleanWord)) return false;
        if (cleanWord.length === 2) return twoLetterWords.has(cleanWord);
        try {
            const response = await fetch(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`
            );
            if (!response.ok) return false;
            const data = await response.json();
            return (
                Array.isArray(data) &&
                data.length > 0 &&
                data[0]?.word?.toLowerCase() === cleanWord
            );
        } catch (error) {
            return false;
        }
    };
    // Checks if the board is contiguous (one of the conditions to trigger a "Boogie") by traversing the tiles with BFS
    const isBoardContiguous = () => {
        const tilePositions = Object.keys(tiles);
        if (tilePositions.length === 0) return true;

        const visited = new Set();
        const queue = [tilePositions[0]];
        visited.add(tilePositions[0]);

        while (queue.length > 0) {
            const current = queue.shift();
            const [x, y] = current.split(",").map(Number);
            const neighbors = [
                [x - 1, y],
                [x + 1, y],
                [x, y - 1],
                [x, y + 1],
            ];

            for (let [nx, ny] of neighbors) {
                const neighborKey = `${nx},${ny}`;
                if (tiles[neighborKey] && !visited.has(neighborKey)) {
                    visited.add(neighborKey);
                    queue.push(neighborKey);
                }
            }
        }

        return visited.size === tilePositions.length;
    };
    // Scans all rows and columns, validating the tiles as words and marking valid positions
    const findWords = async () => {
        let validPositions = new Set();

        const checkAndAddWord = async (word, positions) => {
            if (word.length < 2) return;
            const isValid = await isValidWord(word);
            if (word.length === 2 && !twoLetterWords.has(word.toLowerCase())) {
                return;
            }

            if (isValid) {
                positions.forEach((pos) => validPositions.add(pos));
            }
        };

        for (let row = 0; row < gridSizeY; row++) {
            let word = "",
                positions = [];
            for (let col = 0; col < gridSizeX; col++) {
                const key = `${col},${row}`;
                const tile = tiles[key];
                if (tile?.letter) {
                    word += tile.letter;
                    positions.push(key);
                } else {
                    await checkAndAddWord(word, positions);
                    word = "";
                    positions = [];
                }
            }
            await checkAndAddWord(word, positions);
        }

        for (let col = 0; col < gridSizeX; col++) {
            let word = "",
                positions = [];
            for (let row = 0; row < gridSizeY; row++) {
                const key = `${col},${row}`;
                const tile = tiles[key];
                if (tile?.letter) {
                    word += tile.letter;
                    positions.push(key);
                } else {
                    await checkAndAddWord(word, positions);
                    word = "";
                    positions = [];
                }
            }
            await checkAndAddWord(word, positions);
        }

        setValidWords(validPositions);
        // If all tiles are valid and contiguous and the rack is empty, trigger a "Boogie"
        const allBoardKeys = Object.keys(tiles);
        const allValid = allBoardKeys.every((key) => validPositions.has(key));

        if (
            allBoardKeys.length > 0 &&
            allValid &&
            isBoardContiguous() &&
            rackTiles.length === 0 // ✅ rack must be empty!
        ) {
            console.log("Boogie triggered!");
            window.dispatchEvent(new Event("triggerBoogie"));
        }
    };
    // Validates words whenever board tiles shift or change
    useEffect(() => {
        findWords();
    }, [tiles]);
    // Handles logic to drop tiles from rack to board, as well as between different board positions
    const handleDrop = (item, x, y) => {
        console.log(`Attempting to drop tile "${item.letter}" at (${x}, ${y})`);
        const dropSound = new Audio("/sounds/Click.mp3");
        dropSound.volume = 0.5;
        dropSound.play();

        console.log(`Original tile came from (${item.x}, ${item.y})`);

        if (item.origin === "rack" && item.id) {
            onTilePlacedFromRack(item.id);
            processedTileIdsRef.current.delete(item.id);
        }

        setTiles((prev) => {
            const newTiles = { ...prev };
            if (item.x !== undefined && item.y !== undefined) {
                delete newTiles[`${item.x},${item.y}`];
            }
            const key = `${x},${y}`;
            if (newTiles[key]) return prev;

            newTiles[key] = {
                ...item,
                id:
                    item.id ??
                    `board-${item.letter}-${Date.now()}-${Math.random()}`,
                x,
                y,
                origin: "board",
            };

            return newTiles;
        });
    };
    // Handles logic to allow tiles to be returned to the rack by left-clicking on them
    const lastClickedKeyRef = useRef(null);
    const handleClickEvent = (x, y) => {
        const key = `${x},${y}`;
        if (lastClickedKeyRef.current === key) return;

        lastClickedKeyRef.current = key;
        setTimeout(() => {
            lastClickedKeyRef.current = null;
        }, 100); // Prevents accidental double-returns

        setTiles((prev) => {
            const newTiles = { ...prev };
            const tile = newTiles[key];
            if (tile && !processedTileIdsRef.current.has(tile.id)) {
                console.log(
                    `Returning "${tile.letter}" from board to rack`,
                    tile
                );
                onTileReturnToRack(tile);
            }
            delete newTiles[key];
            return newTiles;
        });
    };
    // Renders board as a grid of BoardCells
    return (
        <div ref={wrapperRef} className="absolute inset-0 overflow-hidden">
            {gridSizeX > 0 && gridSizeY > 0 && (
                <div
                    id="game-board"
                    className="grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${gridSizeX}, ${BOARD_SQUARE_WIDTH}px)`,
                        gridTemplateRows: `repeat(${gridSizeY}, ${BOARD_SQUARE_HEIGHT}px)`,
                        backgroundColor: "transparent",
                        border: "2px solid black",
                        backgroundSize: "cover",
                        backgroundImage:
                            "url('/images/redTealGeo_background.jpg')",
                        position: "relative",
                        zIndex: 0,
                    }}
                >
                    {[...Array(gridSizeX * gridSizeY)].map((_, index) => {
                        const x = index % gridSizeX;
                        const y = Math.floor(index / gridSizeX);
                        const tile = tiles[`${x},${y}`];

                        return (
                            <BoardCell
                                key={`${x},${y}-${gridSizeX}-${gridSizeY}`}
                                x={x}
                                y={y}
                                tile={tile}
                                tiles={tiles}
                                isValid={validWords.has(`${x},${y}`)}
                                onDrop={handleDrop}
                                onClick={handleClickEvent}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GameBoard;
