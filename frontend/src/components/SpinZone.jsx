import React from "react";
import { useDrop } from "react-dnd";
import "./SpinZone.css";

/**
 * SpinZone represents the discardment area for unwanted tiles.
 * When a tile is dragged from the rack or board and dropped here, it is shuffled back into the pile
 * and replaced with 3 new random tiles if available
 */

const SpinZone = ({ onSpin }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: "TILE",
        drop: (item) => {
            if (!item?.letter || (!item.id && item.origin !== "board")) {
                console.warn("Invalid Spin. Missing letter or ID:", item);
                return;
            }

            onSpin(item);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    return (
        <div
            ref={drop}
            className="spinzone-container fixed bottom-5 right-5 z-[9999] w-36 h-36 flex items-center justify-center"
        ></div>
    );
};

export default SpinZone;
