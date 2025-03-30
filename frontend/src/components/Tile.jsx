import React, { useEffect, useState, useRef } from "react";
import { useDrag, useDragLayer } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

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
}) => {
    const [highlighted, setHighlighted] = useState(isNew);
    const ref = useRef(null);

    // Ensures tiles will have a fallback id that is also unique should tiles that move from board --> rack be missing one.
    const stableId = useRef(
        id || `tile-${letter}-${Date.now()}-${Math.random()}`
    );

    //Brief yellow highlight denoting when a tile on the rack is "new"
    useEffect(() => {
        if (isNew) {
            const timeout = setTimeout(() => {
                setHighlighted(false);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [isNew]);

    // Hook for making the tile draggable using react-dnd
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

    // Apply drag behavior and hide the default ghost preview
    useEffect(() => {
        drag(ref);
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [ref, drag, preview]);

    // Set dimensions based on board tile size
    const TILE_WIDTH = BOARD_SQUARE_WIDTH * 0.9;
    const TILE_HEIGHT = BOARD_SQUARE_HEIGHT * 0.9;

    return (
        <div
            ref={ref}
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
                backgroundImage:
                    "linear-gradient(to bottom right, rgba(255,255,255,0.6), rgba(255,255,255,0.1))",
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

// Custom Drag Layer Component, replaces default browser image used during drag
export const CustomDragPreview = () => {
    const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getClientOffset(),
    }));

    if (!isDragging || !currentOffset) return null;

    const TILE_SIZE = 54;

    const style = {
        position: "fixed",
        left: `${currentOffset.x}px`,
        top: `${currentOffset.y}px`,
        transform: "translate(-50%, -50%)",
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        backgroundColor: "rgba(255, 255, 240, 0.95)",
        border: "2px solid #999",
        borderRadius: "8px",
        boxShadow:
            "inset 0 -3px 5px rgba(0,0,0,0.2), 2px 2px 5px rgba(0,0,0,0.3)",
        fontSize: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        color: "#000",
        zIndex: 9999,
        pointerEvents: "none",
    };

    return <div style={style}>{item?.letter}</div>;
};
