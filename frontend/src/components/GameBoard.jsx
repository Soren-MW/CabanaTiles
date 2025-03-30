import React, { useState, useEffect, useRef, useCallback } from "react";
import BoardCell from "./BoardCell";
// Constants for square dimensions
const BOARD_SQUARE_WIDTH = 60;
const BOARD_SQUARE_HEIGHT = 60;

const GameBoard = ({
    tiles,
    setTiles,
    rackTiles,
    onTilePlacedFromRack,
    onTileReturnToRack,
    processedTileIdsRef,
    triggerBoogie,
}) => {
    const wrapperRef = useRef(null);
    const [gridSizeX, setGridSizeX] = useState(10);
    const [gridSizeY, setGridSizeY] = useState(10);
    const [validWords, setValidWords] = useState(new Set());
    const [recentTileCoords, setRecentTileCoords] = useState([]);
    const prevWordsRef = useRef(new Map());
    const invalidPositionsRef = useRef(new Set());
    const wordSetRef = useRef(null);
    const dropSoundRef = useRef(null);

    // Loads and prepares sound feedback for tile placement
    useEffect(() => {
        dropSoundRef.current = new Audio("/sounds/Click.mp3");
        dropSoundRef.current.volume = 0.5;
        dropSoundRef.current.load();
        return () => {
            dropSoundRef.current.pause();
            dropSoundRef.current = null;
        };
    }, []);
    // Dynamically resizes grid as user shifts window dimensions
    useEffect(() => {
        const updateGridSize = () => {
            const { width, height } =
                wrapperRef.current.getBoundingClientRect();
            const cols = Math.floor(width / BOARD_SQUARE_WIDTH);
            const rows = Math.floor(height / BOARD_SQUARE_HEIGHT);
            setGridSizeX(cols);
            setGridSizeY(rows);
        };
        updateGridSize();
        window.addEventListener("resize", updateGridSize);
        return () => window.removeEventListener("resize", updateGridSize);
    }, []);

    // Loads JSON of SOWPODS, a popular Scrabble dictionary, to use for fast word validation
    useEffect(() => {
        fetch("/sowpods.json")
            .then((res) => res.json())
            .then((data) => {
                wordSetRef.current = new Set(data.map((w) => w.toLowerCase()));
                console.log(
                    "Word list loaded with",
                    wordSetRef.current.size,
                    "words"
                );
            })
            .catch((err) => console.error("Failed to load word list", err));
    }, []);

    // Hardcoded two-letter word set leftover from when dictionary API was used for validation. Will get rid of it later.

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
    // Checks if word is valid. Pushes to whitelist of 2-letter words if length is 2, SOWPODS if greater.
    const isValidWord = (word) => {
        if (!word || word.length < 2) return false;
        const clean = word.toLowerCase();
        return word.length === 2
            ? twoLetterWords.has(clean)
            : wordSetRef.current?.has(clean);
    };

    //Implements BFS to confirm that all words on the board are contiguous (or connected)
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
    /**
     * Checks rows and cols near recently changed tiles
     * Checks if words are still valid
     * Populates validWords for visual feedback (tiles are green if words are valid)
     * Triggers "Boogie" if all words are valid + contiguous + the rack is empty.
     
     */
    const validateAround = (coordsArray) => {
        const validatedWords = new Set();
        prevWordsRef.current.clear();
        invalidPositionsRef.current.clear();
        const wordMembershipMap = new Map();

        const addToWordMap = (pos, word) => {
            const posKey = `${pos}`;
            if (!wordMembershipMap.has(posKey)) {
                wordMembershipMap.set(posKey, new Set());
            }
            wordMembershipMap.get(posKey).add(word);
        };

        const checkAndAddWord = (word, positions) => {
            if (word.length < 2) return;
            const lowerWord = word.toLowerCase();
            const key = positions.join("|");
            const prevWord = prevWordsRef.current.get(key);
            if (prevWord === word) return;
            prevWordsRef.current.set(key, word);
            const isValid = isValidWord(word);
            positions.forEach((pos) => {
                addToWordMap(`${pos}`, lowerWord);
            });
            if (isValid) {
                validatedWords.add(lowerWord);
            } else {
                positions.forEach((pos) =>
                    invalidPositionsRef.current.add(`${pos}`)
                );
            }
        };

        const checkRow = (row) => {
            let word = "",
                positions = [];
            for (let col = 0; col < gridSizeX; col++) {
                const key = `${col},${row}`;
                const tile = tiles[key];
                if (tile?.letter) {
                    word += tile.letter;
                    positions.push(key);
                } else {
                    checkAndAddWord(word, positions);
                    word = "";
                    positions = [];
                }
            }
            checkAndAddWord(word, positions);
        };

        const checkCol = (col) => {
            let word = "",
                positions = [];
            for (let row = 0; row < gridSizeY; row++) {
                const key = `${col},${row}`;
                const tile = tiles[key];
                if (tile?.letter) {
                    word += tile.letter;
                    positions.push(key);
                } else {
                    checkAndAddWord(word, positions);
                    word = "";
                    positions = [];
                }
            }
            checkAndAddWord(word, positions);
        };

        for (const { x, y } of coordsArray) {
            checkRow(y);
            checkCol(x);
        }

        const trulyValidPositions = new Set();
        for (const [pos, wordSet] of wordMembershipMap.entries()) {
            let allValid = true;
            for (const word of wordSet) {
                if (!validatedWords.has(word)) {
                    allValid = false;
                    break;
                }
            }
            if (allValid) {
                trulyValidPositions.add(pos);
            }
        }

        setValidWords((prev) => {
            const updated = new Set(prev);
            for (const pos of Object.keys(tiles)) {
                if (trulyValidPositions.has(pos)) {
                    updated.add(pos);
                } else {
                    updated.delete(pos);
                }
            }
            return updated;
        });

        const allPlacedTilesValid = Object.keys(tiles).every((key) =>
            trulyValidPositions.has(key)
        );
        const contiguous = isBoardContiguous();
        const rackEmpty = rackTiles.length === 0;

        if (allPlacedTilesValid && contiguous && rackEmpty) {
            triggerBoogie();
        }
    };
    // Starts validation whenever tile state changes. Will optimize this in the future
    useEffect(() => {
        if (Object.keys(tiles).length > 0) {
            const allCoords = Object.keys(tiles).map((key) => {
                const [x, y] = key.split(",").map(Number);
                return { x, y };
            });
            validateAround(allCoords);
        }
    }, [tiles, rackTiles]);

    // Handles tile placement, rendering, sound, and validation of nearby grid spaces.
    const handleDrop = useCallback(
        (item, x, y) => {
            const originalTile = { ...item };
            const movedTile = {
                ...originalTile,
                x,
                y,
                origin: "board",
            };

            setTiles((prevTiles) => {
                const updatedTiles = { ...prevTiles };
                if (originalTile.x !== null && originalTile.y !== null) {
                    delete updatedTiles[`${originalTile.x},${originalTile.y}`];
                }
                updatedTiles[`${x},${y}`] = movedTile;
                return updatedTiles;
            });

            if (originalTile.origin === "rack") {
                onTilePlacedFromRack(originalTile.id);
            }

            const expandedCoords = [
                { x, y },
                { x: x - 1, y },
                { x: x + 1, y },
                { x, y: y - 1 },
                { x, y: y + 1 },
            ];
            validateAround(expandedCoords);
            setRecentTileCoords([{ x, y }]);
        },
        [setTiles, onTilePlacedFromRack, validateAround]
    );
    // Logic for returning tile to rack with left-click
    const handleClickEvent = (x, y) => {
        const key = `${x},${y}`;
        onTileReturnToRack(tiles[key]);
        setTiles((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
        setRecentTileCoords([{ x, y }]);
    };
    //Render board and cells
    return (
        <div ref={wrapperRef} className="absolute inset-0 overflow-hidden">
            <div
                id="game-board"
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${gridSizeX},${BOARD_SQUARE_WIDTH}px)`,
                    gridTemplateRows: `repeat(${gridSizeY},${BOARD_SQUARE_HEIGHT}px)`,
                }}
            >
                {[...Array(gridSizeX * gridSizeY)].map((_, i) => {
                    const x = i % gridSizeX;
                    const y = Math.floor(i / gridSizeX);
                    return (
                        <BoardCell
                            key={`${x},${y}`}
                            x={x}
                            y={y}
                            tile={tiles[`${x},${y}`]}
                            tiles={tiles}
                            isValid={validWords.has(`${x},${y}`)}
                            onDrop={handleDrop}
                            onClick={handleClickEvent}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default GameBoard;
