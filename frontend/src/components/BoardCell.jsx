import React, { useEffect, useRef } from "react";
import { useDrop } from "react-dnd";
import Tile from "./Tile";

/**BoardCell represents a given square on the game board.
 * This file handles the logic for dropping tiles via React DnD and
 * holds feedback for occupancy and validity of square (does the tile on the square form a valid word w all contiguous tiles?)
 */

const BoardCell = ({ x, y, tile, tiles, onDrop, onClick, isValid }) => {
    // Accesses most recent tiles state for canDrop && drop functions
    const tilesRef = useRef(tiles);
    useEffect(() => {
        tilesRef.current = tiles;
    }, [tiles]);

    // Configures cell as a drop target with DnD
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: "TILE",
        canDrop: () => {
            const key = `${x},${y}`;
            const occupied = Boolean(tilesRef.current[key]);
            return !occupied;
        },
        // Prevents dropping on an occupied square, will possibly include audio feedback in future
        drop: (item) => {
            const key = `${x},${y}`;
            if (tilesRef.current[key]) {
                return;
            }
            onDrop(item, x, y);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    const prevTileRef = useRef(tile);

    useEffect(() => {
        // Tracks tile itenerary for debugging purposes
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
                ${isOver && !canDrop ? "bg-red-300 border-4 border-red-600" : ""}
                ${isOver && canDrop ? "bg-green-300" : ""}
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
                />
            ) : null}
        </div>
    );
};

export default BoardCell;
