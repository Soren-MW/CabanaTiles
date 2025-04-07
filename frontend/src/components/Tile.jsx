import React, { useEffect, useState, useRef } from "react";
import { useDrag, useDragLayer } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import CustomDragPreview from "./CustomDragPreview";

const BOARD_SQUARE_WIDTH = 60;
const BOARD_SQUARE_HEIGHT = 60;

const Tile = ({
    id,
    letter,
    x = null,
    y = null,
    isValid,
    rackIndex = null,
    origin = "rack",
    isNew = false,
    onRightClick = () => {},
}) => {
    const [highlighted, setHighlighted] = useState(isNew);
    const ref = useRef(null);

    const stableId = useRef(
        id || `tile-${letter}-${Date.now()}-${Math.random()}`
    );

    useEffect(() => {
        if (isNew) {
            const timeout = setTimeout(() => {
                setHighlighted(false);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [isNew]);

    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: "TILE",
        item: () => {
            const itemData = {
                id: stableId.current,
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

    useEffect(() => {
        drag(ref);
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [ref, drag, preview]);

    const TILE_WIDTH = BOARD_SQUARE_WIDTH * 0.9;
    const TILE_HEIGHT = BOARD_SQUARE_HEIGHT * 0.9;

    return (
        <div
            ref={ref}
            onContextMenu={(e) => {
                e.preventDefault();
                const tileData = {
                    id: stableId.current,
                    letter,
                    x,
                    y,
                    origin,
                    isNew,
                };
                console.log("Right click detected for: ", tileData);
                if (typeof onRightClick === "function") {
                    onRightClick(tileData);
                } else {
                    console.warn(
                        "onRightClick is not a function!",
                        onRightClick
                    );
                }
            }}
            className={`border border-gray-600 flex items-center justify-center text-2xl font-bold cursor-pointer 
                ${isDragging ? "opacity-0" : ""}
                ${isValid ? "bg-green-500 text-white" : "bg-white text-black"}
                ${
                    highlighted
                        ? "ring-3 ring-yellow-300 scale-105 transition-transform duration-300"
                        : ""
                }`}
            style={{
                width: `${TILE_WIDTH}px`,
                height: `${TILE_HEIGHT}px`,
                fontSize: `${TILE_WIDTH * 0.5}px`,
                lineHeight: `${TILE_HEIGHT}px`,
                backgroundColor: isValid ? "#22c55e" : "#ffffff",
                backgroundImage: isValid
                    ? "linear-gradient(to bottom right, rgba(255,255,255,0.4), rgba(34,197,94,0.2))"
                    : "linear-gradient(to bottom right, rgba(255,255,255,0.6), rgba(255,255,255,0.1))",
                color: isValid ? "#ffffff" : "#000000",
                borderRadius: "8px",
                boxShadow:
                    "inset 0 -3px 5px rgba(0,0,0,0.2), 2px 2px 5px rgba(0,0,0,0.3)",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
            }}
        >
            {letter}
        </div>
    );
};

export default Tile;
