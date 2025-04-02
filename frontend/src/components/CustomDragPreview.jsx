import React from "react";
import { useDragLayer } from "react-dnd";

const TILE_SIZE = 54;

const CustomDragPreview = React.memo(() => {
    const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getClientOffset(),
    }));

    if (!isDragging || !currentOffset) return null;

    const style = {
        position: "fixed",
        left: `${currentOffset.x}px`,
        top: `${currentOffset.y}px`,
        transform: "translate(-50%, -50%)",
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        backgroundImage: "linear-gradient(145deg, #fefae0, #fffef0)",
        borderRadius: "8px",
        boxShadow:
            "inset 0 -3px 5px rgba(0,0,0,0.2), 1px 2px 6px rgba(0,0,0,0.35)",
        textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
        border: "1px solid #ccc",
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
});

export default CustomDragPreview;
