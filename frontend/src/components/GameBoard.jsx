import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useLayoutEffect,
} from "react";
import BoardCell from "./BoardCell";

const TARGET_GRID_COLS = 42;
const TARGET_GRID_ROWS = 24;

const GameBoard = ({
    tiles,
    setTiles,
    rackTiles,
    onTilePlacedFromRack,
    onTileReturnToRack,
    triggerBoogie,
    onSpin,
    remainingTiles,
    triggerWin,
    setRackTiles,
    tileSize,
    setTileSize,
}) => {
    const wrapperRef = useRef(null);
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

    useLayoutEffect(() => {
        const updateTileSize = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const tileWidth = screenWidth / TARGET_GRID_COLS;
            const tileHeight = screenHeight / TARGET_GRID_ROWS;
            const newTileSize = Math.floor(Math.min(tileWidth, tileHeight));
            setTileSize(newTileSize);
        };

        updateTileSize();
        window.addEventListener("resize", updateTileSize);

        return () => window.removeEventListener("resize", updateTileSize);
    }, []);

    useEffect(() => {
        fetch("/sowpods.json")
            .then((res) => res.json())
            .then((data) => {
                wordSetRef.current = new Set(data.map((w) => w.toLowerCase()));
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

    const validateWords = useCallback(() => {
        const tileToWords = new Map();
        const validWordSet = new Set();
        const words = [];

        // Horizontal words
        for (let y = 0; y < TARGET_GRID_ROWS; y++) {
            let word = "",
                positions = [];
            for (let x = 0; x < TARGET_GRID_COLS; x++) {
                const key = `${x},${y}`;
                const tile = tiles[key];
                if (tile?.letter) {
                    const isAdjacent =
                        positions.length === 0 ||
                        parseInt(
                            positions[positions.length - 1].split(",")[0]
                        ) ===
                            x - 1;

                    if (isAdjacent) {
                        word += tile.letter;
                        positions.push(key);
                    } else {
                        if (word.length > 1) words.push({ word, positions });
                        word = tile.letter;
                        positions = [key];
                    }
                } else {
                    if (word.length > 1) words.push({ word, positions });
                    word = "";
                    positions = [];
                }
            }
            if (word.length > 1) words.push({ word, positions });
        }

        // Vertical words
        for (let x = 0; x < TARGET_GRID_COLS; x++) {
            let word = "",
                positions = [];
            for (let y = 0; y < TARGET_GRID_ROWS; y++) {
                const key = `${x},${y}`;
                const tile = tiles[key];
                if (tile?.letter) {
                    const isAdjacent =
                        positions.length === 0 ||
                        parseInt(
                            positions[positions.length - 1].split(",")[1]
                        ) ===
                            y - 1;

                    if (isAdjacent) {
                        word += tile.letter;
                        positions.push(key);
                    } else {
                        if (word.length > 1) words.push({ word, positions });
                        word = tile.letter;
                        positions = [key];
                    }
                } else {
                    if (word.length > 1) words.push({ word, positions });
                    word = "";
                    positions = [];
                }
            }
            if (word.length > 1) words.push({ word, positions });
        }

        for (const { word, positions } of words) {
            const lower = word.toLowerCase();
            const isValid = isValidWord(lower);
            if (isValid) validWordSet.add(lower);
            for (const pos of positions) {
                if (!tileToWords.has(pos)) tileToWords.set(pos, new Set());
                tileToWords.get(pos).add(lower);
            }
        }

        const trulyValidPositions = new Set();
        for (const [pos, wordSet] of tileToWords.entries()) {
            const allValid = [...wordSet].every((w) => validWordSet.has(w));
            if (allValid) trulyValidPositions.add(pos);
        }

        setValidWords(trulyValidPositions);
    }, [tiles]);

    useEffect(() => {
        validateWords();
    }, [tiles, validateWords]);

    const handleDrop = useCallback(
        (item, x, y) => {
            setTiles((prevTiles) => {
                const key = `${x},${y}`;
                if (prevTiles[key]) return prevTiles;
                const movedTile = { ...item, x, y, origin: "board" };
                const updated = { ...prevTiles };
                if (item.x !== null && item.y !== null) {
                    delete updated[`${item.x},${item.y}`];
                }
                updated[key] = movedTile;
                if (item.origin === "rack") {
                    onTilePlacedFromRack(item.id);
                }
                return updated;
            });
        },
        [setTiles, onTilePlacedFromRack]
    );

    const handleClickEvent = useCallback(
        (x, y) => {
            const key = `${x},${y}`;
            onTileReturnToRack(tiles[key]);
            setTiles((prev) => {
                const updated = { ...prev };
                delete updated[key];
                return updated;
            });
        },
        [tiles, setTiles, onTileReturnToRack]
    );

    const memoizedOnSpin = useCallback((tile) => onSpin(tile), [onSpin]);

    if (!tileSize || tileSize <= 1) {
        return (
            <div
                id="game-board"
                style={{
                    visibility: "hidden",
                    width: "100vw",
                    height: "100vh",
                }}
            />
        );
    }

    return (
        <div
            id="game-board"
            ref={wrapperRef}
            className="absolute top-0 left-0"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "grid",
                gridTemplateColumns: `repeat(${TARGET_GRID_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${TARGET_GRID_ROWS}, 1fr)`,
                gap: "0px",
                boxSizing: "border-box",
            }}
        >
            {[...Array(TARGET_GRID_COLS * TARGET_GRID_ROWS)].map((_, i) => {
                const x = i % TARGET_GRID_COLS;
                const y = Math.floor(i / TARGET_GRID_COLS);
                const key = `${x},${y}`;
                return (
                    <BoardCell
                        key={`${x},${y}-${tileSize}`}
                        x={x}
                        y={y}
                        tile={tiles[key]}
                        tileSize={tileSize}
                        isValid={validWords.has(key)}
                        isOccupied={!!tiles[key]}
                        onDrop={handleDrop}
                        onClick={handleClickEvent}
                        onSpin={memoizedOnSpin}
                    />
                );
            })}
        </div>
    );
};

export default GameBoard;
