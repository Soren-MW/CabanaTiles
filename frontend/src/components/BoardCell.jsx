import React, { useEffect, useRef } from "react";
import { useDrop } from "react-dnd";
import Tile from "./Tile";

const BoardCell = ({
    x,
    y,
    tile,
    isOccupied,
    onDrop,
    onClick,
    isValid,
    onSpin = () => {},
}) => {
    const [, drop] = useDrop(() => ({
        accept: "TILE",
        canDrop: () => !isOccupied,
        drop: (item) => {
            if (!isOccupied) {
                onDrop(item, x, y);
            }
        },
    }));

    const prevTileRef = useRef(tile);
    useEffect(() => {
        const prevTile = prevTileRef.current;
        if (!prevTile && tile) {
            console.log(`Tile placed at (${x}, ${y}):`, tile);
        } else if (prevTile && !tile) {
            console.log(`Tile removed from (${x}, ${y})`);
        }
        prevTileRef.current = tile;
    }, [tile, x, y]);

    return (
        <div
            ref={drop}
            className={`w-[60px] h-[60px] border border-gray-500 bg-transparent flex items-center justify-center
                ${isValid ? "bg-green-500" : ""}`}
            onClick={(e) => {
                e.stopPropagation();
                if (tile) onClick(x, y);
            }}
        >
            {tile ? (
                <Tile
                    letter={tile.letter}
                    x={x}
                    y={y}
                    isValid={isValid}
                    origin="board"
                    onRightClick={() => {
                        if (tile && typeof onSpin === "function") {
                            onSpin({
                                id: tile.id,
                                letter: tile.letter,
                                origin: "board",
                                x,
                                y,
                                isNew: tile.isNew || false,
                            });
                        } else {
                            /*console.warn(
                                "Tile or onSpin missing on right-click",
                                { tile, x, y }
                            );*/
                        }
                    }}
                />
            ) : null}
        </div>
    );
};

export default React.memo(BoardCell, (prevProps, nextProps) => {
    return (
        prevProps.tile === nextProps.tile &&
        prevProps.isValid === nextProps.isValid
    );
});
