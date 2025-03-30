import React, { useEffect, useRef } from "react";
import { useDrop } from "react-dnd";
import Tile from "./Tile";

/* Boardcell represents a single cell on the game board. 
It handles drag-and-drop interactions with ReactDND
Also some tile placement logic and visual feedback related to word validity.
Recently stripped of certain visual feedback elements due to insane performance tax

*/

const BoardCell = ({ x, y, tile, tiles, onDrop, onClick, isValid }) => {
    // Maintains a live ref to the latest tile object to avoid stale closure .
    const tilesRef = useRef(tiles);
    useEffect(() => {
        tilesRef.current = tiles;
    }, [tiles]);

    // Configures cell as a potential location for a tile drop
    const [, drop] = useDrop(() => ({
        accept: "TILE",
        canDrop: () => {
            // Unless it's occupied
            const key = `${x},${y}`;
            return !tilesRef.current[key];
        },

        // If not, the tile drops on the square
        drop: (item) => {
            const key = `${x},${y}`;
            if (!tilesRef.current[key]) {
                onDrop(item, x, y);
            }
        },
    }));
    // Keeps track of previous tile for console logging removal and placement
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
                />
            ) : null}
        </div>
    );
};
// Prevent unnecessary renders of cells unless the tile or validity changes
export default React.memo(BoardCell, (prevProps, nextProps) => {
    return (
        prevProps.tile === nextProps.tile &&
        prevProps.isValid === nextProps.isValid
    );
});
