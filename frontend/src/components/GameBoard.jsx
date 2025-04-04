import React, { useState, useEffect, useRef, useCallback } from "react";
import BoardCell from "./BoardCell";

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
    onSpin,
    remainingTiles,
    triggerWin,
}) => {
    const wrapperRef = useRef(null);
    const [gridSizeX, setGridSizeX] = useState(10);
    const [gridSizeY, setGridSizeY] = useState(10);
    const [validWords, setValidWords] = useState(new Set());
    const wordSetRef = useRef(null);
    const dropSoundRef = useRef(null);

    useEffect(() => {
        dropSoundRef.current = new Audio("/sounds/Click.mp3");
        dropSoundRef.current.volume = 0.5;
        dropSoundRef.current.load();
        return () => {
            dropSoundRef.current.pause();
            dropSoundRef.current = null;
        };
    }, []);

    useEffect(() => {
        const updateGridSize = () => {
            const { width, height } =
                wrapperRef.current.getBoundingClientRect();
            const cols = Math.ceil(width / BOARD_SQUARE_WIDTH);
            const rows = Math.ceil(height / BOARD_SQUARE_HEIGHT);
            setGridSizeX(cols);
            setGridSizeY(rows);
        };
        updateGridSize();
        window.addEventListener("resize", updateGridSize);
        return () => window.removeEventListener("resize", updateGridSize);
    }, []);

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

    const isValidWord = (word) => {
        if (!word || word.length < 2) return false;
        const clean = word.toLowerCase();
        return word.length === 2
            ? twoLetterWords.has(clean)
            : wordSetRef.current?.has(clean);
    };

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

    const validateWords = () => {
        performance.mark("validateWords-start");
        const words = [];
        const tileToWords = new Map();
        const validWordSet = new Set();

        const addTileToWord = (pos, word) => {
            if (!tileToWords.has(pos)) tileToWords.set(pos, new Set());
            tileToWords.get(pos).add(word);
        };

        const extractWords = () => {
            for (let y = 0; y < gridSizeY; y++) {
                let word = "";
                let positions = [];
                for (let x = 0; x < gridSizeX; x++) {
                    const key = `${x},${y}`;
                    const tile = tiles[key];
                    if (tile?.letter) {
                        word += tile.letter;
                        positions.push(key);
                    } else {
                        if (word.length > 1) words.push({ word, positions });
                        word = "";
                        positions = [];
                    }
                }
                if (word.length > 1) words.push({ word, positions });
            }

            for (let x = 0; x < gridSizeX; x++) {
                let word = "";
                let positions = [];
                for (let y = 0; y < gridSizeY; y++) {
                    const key = `${x},${y}`;
                    const tile = tiles[key];
                    if (tile?.letter) {
                        word += tile.letter;
                        positions.push(key);
                    } else {
                        if (word.length > 1) words.push({ word, positions });
                        word = "";
                        positions = [];
                    }
                }
                if (word.length > 1) words.push({ word, positions });
            }
        };

        extractWords();

        for (const { word, positions } of words) {
            const lower = word.toLowerCase();
            const isValid = isValidWord(word);
            if (isValid) validWordSet.add(lower);
            for (const pos of positions) {
                addTileToWord(pos, lower);
            }
        }

        const trulyValidPositions = new Set();
        for (const [pos, wordSet] of tileToWords.entries()) {
            let allValid = true;
            for (const word of wordSet) {
                if (!validWordSet.has(word)) {
                    allValid = false;
                    break;
                }
            }
            if (allValid) trulyValidPositions.add(pos);
        }

        setValidWords(trulyValidPositions);

        const allPlacedValid = Object.keys(tiles).every((key) =>
            trulyValidPositions.has(key)
        );
        const contiguous = isBoardContiguous();
        const rackEmpty = rackTiles.length === 0;

        if (allPlacedValid && contiguous && rackEmpty) {
            if (remainingTiles > 0) {
                triggerBoogie();
            } else {
                triggerWin();
            }
        }
        performance.mark("validateWords-end");
        performance.measure(
            "validateWords",
            "validateWords-start",
            "validateWords-end"
        );
    };

    const prevTilesRef = useRef(tiles);

    useEffect(() => {
        const prevKeys = Object.keys(prevTilesRef.current || {});
        const currentKeys = Object.keys(tiles);

        const tilesChanged =
            prevKeys.length !== currentKeys.length ||
            prevKeys.some((key) => {
                const prevTile = prevTilesRef.current[key];
                const newTile = tiles[key];
                return (
                    !newTile ||
                    prevTile?.id !== newTile?.id ||
                    prevTile?.letter !== newTile?.letter
                );
            });

        if (tilesChanged) {
            console.count("📏 validateWords triggered");
            validateWords();
            prevTilesRef.current = tiles;
        }
    }, [tiles]);

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
                console.count("setTiles");

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
        },
        [setTiles, onTilePlacedFromRack]
    );

    const handleClickEvent = useCallback(
        (x, y) => {
            const key = `${x},${y}`;
            onTileReturnToRack(tiles[key]);
            setTiles((prev) => {
                console.count("setTiles");

                const updated = { ...prev };
                delete updated[key];
                return updated;
            });
        },
        [tiles, setTiles, onTileReturnToRack]
    );

    const memoizedOnSpin = useCallback(
        (tile) => {
            onSpin(tile);
        },
        [onSpin]
    );

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
                    const key = `${x},${y}`;
                    const isOccupied = Boolean(tiles[key]);
                    return (
                        <BoardCell
                            key={`${x},${y}`}
                            x={x}
                            y={y}
                            tile={tiles[`${x},${y}`]} // ✅ still needed
                            isValid={validWords.has(`${x},${y}`)}
                            isOccupied={isOccupied} // ✅ new!
                            onDrop={handleDrop}
                            onClick={handleClickEvent}
                            onSpin={memoizedOnSpin}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default GameBoard;
