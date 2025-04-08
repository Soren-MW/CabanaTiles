import { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GameBoard from "./GameBoard";
import TileRack from "./TileRack";
import CabanaTitle from "./CabanaTitle";
import TileCounter from "./TileCounter";
import BoogieEffect from "./BoogieEffect";
import ShakeUpEffect from "./ShakeUpEffect";
import CountdownOverlay from "./CountdownOverlay";
import WinOverlay from "./WinOverlay";
import CustomDragPreview from "./CustomDragPreview";

function GamePage() {
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

    const totalTiles = 76;
    const rackSize = 21;
    const tileIdRef = useRef(0);

    const generateScaledTilePool = (distribution, targetTotal) => {
        const allTiles = [];
        Object.entries(distribution).forEach(([letter, count]) => {
            for (let i = 0; i < count; i++) allTiles.push(letter);
        });
        for (let i = allTiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
        }
        return allTiles.slice(0, targetTotal).map((letter) => {
            tileIdRef.current += 1;
            return { id: `tile-${tileIdRef.current}`, letter };
        });
    };

    const [fullPool] = useState(() =>
        generateScaledTilePool(distribution, totalTiles)
    );
    const [rackTiles, setRackTiles] = useState(() =>
        fullPool.slice(0, rackSize)
    );
    const [remainingPool, setRemainingPool] = useState(() =>
        fullPool.slice(rackSize)
    );
    const [tiles, setTiles] = useState({});
    const [showBoogieEffect, setShowBoogieEffect] = useState(false);
    const [showShakeup, setShowShakeup] = useState(false);
    const [isCountingDown, setIsCountingDown] = useState(true);
    const [showWin, setShowWin] = useState(false);

    const remainingPoolRef = useRef(remainingPool);

    const triggerBoogie = () => {
        setShowBoogieEffect(true);
        setTimeout(() => setShowBoogieEffect(false), 1000);
        const event = new Event("triggerBoogie");
        window.dispatchEvent(event);
    };

    useEffect(() => {
        remainingPoolRef.current = remainingPool;
    }, [remainingPool]);

    useEffect(() => {
        const handleBoogie = () => {
            setRemainingPool((prev) => {
                if (prev.length === 0) return prev;
                const [nextTile, ...rest] = prev;
                tileIdRef.current += 1;
                const boogieTile = {
                    ...nextTile,
                    id: `tile-${tileIdRef.current}`,
                    isNew: true,
                };
                setRackTiles((prevRack) => [...prevRack, boogieTile]);
                console.log("Boogie", boogieTile);
                console.log("Remaining pool size:", rest.length);
                return rest;
            });
        };

        if (!window.boogieListenerAdded) {
            window.addEventListener("triggerBoogie", handleBoogie);
            window.boogieListenerAdded = true;
        }

        return () => {
            window.removeEventListener("triggerBoogie", handleBoogie);
            window.boogieListenerAdded = false;
        };
    }, []);

    const onBoardTileSpun = (tile) => {
        setTiles((prev) => {
            const newTiles = { ...prev };
            delete newTiles[`${tile.x},${tile.y}`];
            return newTiles;
        });
    };

    const handleSpin = (tileToSpin) => {
        if (remainingPoolRef.current.length < 3) {
            alert("Not enough tiles left in the pool!");
            return;
        }

        const newTiles = remainingPoolRef.current.slice(0, 3).map((tile) => {
            tileIdRef.current += 1;
            return { ...tile, id: `tile-${tileIdRef.current}`, isNew: true };
        });

        setRemainingPool((prevPool) => prevPool.slice(3));

        setRackTiles((prevRack) =>
            tileToSpin.origin === "rack"
                ? [
                      ...prevRack.filter((t) => t.id !== tileToSpin.id),
                      ...newTiles,
                  ]
                : [...prevRack, ...newTiles]
        );

        if (tileToSpin.origin === "board") {
            onBoardTileSpun(tileToSpin);
        }

        setShowShakeup(true);
        setTimeout(() => setShowShakeup(false), 1500);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <CustomDragPreview />
            <div className="relative w-screen h-screen overflow-hidden">
                <div className="absolute inset-0 w-full h-full z-0">
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center"
                        style={{
                            backgroundImage:
                                "url('/images/redTealGeo_background.jpg')",
                        }}
                    ></div>
                    <CabanaTitle isOverlay />
                </div>

                {isCountingDown && (
                    <CountdownOverlay
                        onComplete={() => setIsCountingDown(false)}
                    />
                )}

                {!isCountingDown && (
                    <>
                        <div className="w-full flex justify-center bg-transparent fixed top-0 left-0 z-20 h-[60px]">
                            <TileRack tiles={rackTiles} onSpin={handleSpin} />
                        </div>

                        <div className="absolute inset-0 z-10">
                            <GameBoard
                                tiles={tiles}
                                setTiles={setTiles}
                                rackTiles={rackTiles}
                                setRackTiles={setRackTiles}
                                onTilePlacedFromRack={(tileId) =>
                                    setRackTiles((prev) =>
                                        prev.filter(
                                            (tile) => tile.id !== tileId
                                        )
                                    )
                                }
                                onTileReturnToRack={(tile) => {
                                    if (!tile?.id) return;
                                    const safeTile = {
                                        ...tile,
                                        origin: "rack",
                                        x: null,
                                        y: null,
                                    };
                                    setRackTiles((prev) =>
                                        prev.some((t) => t.id === safeTile.id)
                                            ? prev
                                            : [...prev, safeTile]
                                    );
                                }}
                                onSpin={handleSpin}
                                triggerBoogie={triggerBoogie}
                                remainingTiles={remainingPool.length}
                                triggerWin={() => setShowWin(true)}
                            />
                        </div>

                        <TileCounter
                            pileCount={remainingPool.length}
                            rackCount={rackTiles.length}
                        />
                    </>
                )}

                <BoogieEffect
                    show={showBoogieEffect}
                    onComplete={() => setShowBoogieEffect(false)}
                />
                <ShakeUpEffect
                    show={showShakeup}
                    onComplete={() => setShowShakeup(false)}
                />
                <WinOverlay
                    show={showWin}
                    onComplete={() => setShowWin(false)}
                />
            </div>
        </DndProvider>
    );
}

export default GamePage;
