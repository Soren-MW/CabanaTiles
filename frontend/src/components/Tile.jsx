import React, { useEffect, useState, useRef } from "react";
import { useDrag } from "react-dnd";

//Constants to keep uniform tile size with board squares
const BOARD_SQUARE_WIDTH = 60;
const BOARD_SQUARE_HEIGHT = 60;
/**
 * Tile represents a single letter tile in the game.
 * Supported within Tile are:
 * Drag-and-Drop interactions via React DnD
 * Visual feedback for dragging, validitiy, and hover-related highlight states
 * Tracking origin and position of tile pieces
 */

const Tile = ({
    id,
    letter,
    x = null,
    y = null,
    isValid,
    rackIndex = null,
    origin = "rack",
    isNew = false,
}) => {
    const [highlighted, setHighlighted] = useState(isNew);
    const ref = useRef(null);

    // Logic for visual feedback on new tiles (yellow highlight)
    useEffect(() => {
        if (isNew) {
            const timeout = setTimeout(() => {
                setHighlighted(false);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [isNew]);

    // Configures React DnD drag behavior
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: "TILE",
        item: () => {
            const itemData = {
                id,
                letter,
                x,
                y,
                origin,
                rackIndex,
            };
            console.log("Dragging Tile:", itemData);
            return itemData;
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    // Connects preview and drag behavior to tile DOM node
    useEffect(() => {
        if (ref.current) {
            drag(ref);
            preview(ref);
        }
    }, [ref, drag, preview]);

    // Dynamic tile sizing based on dimensions of board squares
    const TILE_WIDTH = BOARD_SQUARE_WIDTH * 0.9;
    const TILE_HEIGHT = BOARD_SQUARE_HEIGHT * 0.9;

    return (
        <div
            ref={ref}
            className={`w-[55px] h-[55px] border border-gray-600 bg-white flex items-center justify-center text-2xl font-bold cursor-pointer 
                ${isDragging ? "border-yellow-400 border-4 scale-105 z-50" : ""} 
                ${isValid ? "text-green-600" : "text-black"}
                ${highlighted ? "ring-3 ring-yellow-300 scale-105 transition-transform duration-300" : ""}`}
            style={{
                width: `${TILE_WIDTH}px`,
                height: `${TILE_HEIGHT}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: `${TILE_WIDTH * 0.5}px`,
                lineHeight: `${TILE_HEIGHT}px`,
                textAlign: "center",
                boxSizing: "border-box",
                backgroundColor: "rgba(255, 255, 240, 0.95)",
                backgroundImage:
                    "linear-gradient(to bottom right, rgba(255,255,255,0.6), rgba(255,255,255,0.1))",
                borderRadius: "8px",
                boxShadow:
                    "inset 0 -3px 5px rgba(0,0,0,0.2), 2px 2px 5px rgba(0,0,0,0.3)",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                opacity: 1,
            }}
        >
            {letter}
        </div>
    );
};

export default Tile;
