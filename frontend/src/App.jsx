import { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GameBoard from "./components/GameBoard";
import TileRack from "./components/TileRack";
import SpinZone from "./components/SpinZone";

// Randomized, trimmed pool of tiles based on BananaGrams letter distribution
const generateScaledTilePool = (distribution, targetTotal) => {
    const allTiles = [];

    Object.entries(distribution).forEach(([letter, count]) => {
        for (let i = 0; i < count; i++) {
            allTiles.push(letter);
        }
    });

    // Shuffle

    for (let i = allTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
    }

    // Trim until target size + assign IDs

    const trimmed = allTiles.slice(0, targetTotal);

    return trimmed.map((letter, index) => ({
        id: `${letter}-${index}-${Date.now()}`,
        letter,
    }));
};

function App() {
    console.log("Rendering App...");

    const distribution = {
        A: 13,
        B: 3,
        C: 3,
        D: 6,
        E: 18,
        F: 3,
        G: 4,
        H: 3,
        I: 12,
        J: 2,
        K: 2,
        L: 5,
        M: 3,
        N: 8,
        O: 11,
        P: 3,
        Q: 2,
        R: 9,
        S: 6,
        T: 9,
        U: 6,
        V: 3,
        W: 3,
        X: 2,
        Y: 3,
        Z: 2,
    };

    const totalTiles = 76; // Starting pool length + rack length for 1P MVP
    const rackSize = 21;

    const fullPool = generateScaledTilePool(distribution, totalTiles);
    const initialRack = fullPool.slice(0, rackSize);
    const initialRemainingPool = fullPool.slice(rackSize);

    // Game State

    const [rackTiles, setRackTiles] = useState(initialRack);
    const [remainingPool, setRemainingPool] = useState(initialRemainingPool);
    const [tiles, setTiles] = useState({});
    const processedTileIds = useRef(new Set());

    // Boogie logic and listener, player must use all tiles from rack towards approved words to trigger

    useEffect(() => {
        const handleBoogie = () => {
            if (remainingPool.length === 0) {
                console.log("No tiles left in pool for Boogying.");
                return;
            }

            const [nextTile, ...rest] = remainingPool;
            const boogieTile = {
                ...nextTile,
                id: `TILE-${nextTile.letter}-${Date.now()}-${Math.random()}`,
                isNew: true,
            };

            setRackTiles((prev) => [...prev, boogieTile]);
            setRemainingPool(rest);

            console.log("Boogie", boogieTile);
            console.log("Remaining pool size:", rest.length);
        };

        window.addEventListener("triggerBoogie", handleBoogie);
        return () => window.removeEventListener("triggerBoogie", handleBoogie);
    }, [remainingPool]);

    // Send tile back to pile when DnD'd to Icon

    const onBoardTileSpun = (tile) => {
        setTiles((prev) => {
            const newTiles = { ...prev };
            delete newTiles[`${tile.x},${tile.y}`];
            return newTiles;
        });
    };

    // 1 tile DnD'd = 3 random tiles yielded from pool

    const handleSpin = (tileToSpin) => {
        if (
            !tileToSpin ||
            (!tileToSpin.id &&
                (tileToSpin.origin !== "board" ||
                    tileToSpin.x == null ||
                    tileToSpin.y == null))
        ) {
            console.warn("Invalid tile:", tileToSpin);
            return;
        }

        if (remainingPool.length < 3) {
            alert("Not enough tiles left in the pool for boogying!");
            return;
        }

        const newPool = [...remainingPool, tileToSpin];
        for (let i = newPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newPool[i], newPool[j]] = [newPool[j], newPool[i]];
        }

        const newTiles = newPool.slice(0, 3).map((tile) => ({
            ...tile,
            id: `TILE-${tile.letter}-${Date.now()}-${Math.random()}`,
            isNew: true,
        }));

        setRemainingPool(newPool.slice(3));
        setRackTiles((prev) => [...prev, ...newTiles]);

        if (tileToSpin.origin === "rack") {
            setRackTiles((prevRack) =>
                prevRack.filter((t) => t.id !== tileToSpin.id)
            );
        } else if (tileToSpin.origin === "board") {
            onBoardTileSpun(tileToSpin);
        }

        console.log("Spun tile:", tileToSpin);
        console.log("Gained tiles from pool:", newTiles);
        console.log("Pool size:", newPool.length - 3);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="relative w-screen h-screen overflow-hidden">
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
                    style={{
                        backgroundImage:
                            "url('/images/redTealGeo_background.jpg')",
                    }}
                ></div>
                /* Anchored Tile Container -- Handles rendering of tiles and
                "Spin" mechanic */
                <div className="absolute bottom-5 w-full flex justify-center z-50 px-4">
                    <TileRack tiles={rackTiles} onSpin={handleSpin} />
                </div>
                <div className="absolute inset-0 z-10">
                    <GameBoard
                        tiles={tiles}
                        setTiles={setTiles}
                        rackTiles={rackTiles}
                        onTilePlacedFromRack={(
                            // Updates state of rackTiles upon moving a tile from the rack to the board
                            tileId
                        ) =>
                            setRackTiles((prev) =>
                                prev.filter((tile) => tile.id !== tileId)
                            )
                        }
                        // Stopgap to prevent Board -> Rack events from creating duplicate tiles
                        onTileReturnToRack={(tile) => {
                            if (!tile?.id) {
                                console.warn(
                                    "Tile missing ID. Skipping return.",
                                    tile
                                );
                                return;
                            }

                            if (processedTileIds.current.has(tile.id)) {
                                console.warn("Duplicate return blocked:", tile);
                                return;
                            }

                            processedTileIds.current.add(tile.id);

                            const safeTile = {
                                ...tile,
                                origin: "rack",
                                x: null,
                                y: null,
                            };

                            setRackTiles((prev) => {
                                if (prev.some((t) => t.id === safeTile.id))
                                    return prev;
                                return [...prev, safeTile];
                            });

                            processedTileIds.current.delete(tile.id);
                        }}
                        onBoardTileSpun={onBoardTileSpun}
                        processedTileIdsRef={processedTileIds}
                    />
                </div>
                <SpinZone onSpin={handleSpin} />
                <div className="absolute bottom-1 left-1 z-50 text-xs text-white bg-black/50 px-2 py-1 rounded">
                    <div> Pile: {remainingPool.length}</div>
                    <div> Rack: {rackTiles.length}</div>
                </div>
                <div className="absolute bottom-1 right-1 z-50 text-xs text-white bg-black/50 px-2 py-1 rounded">
                    Pattern via{" "}
                    <a
                        href="https://publicdomainimages.net"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        Public Domain Images
                    </a>
                </div>
            </div>
        </DndProvider>
    );
}

export default App;
