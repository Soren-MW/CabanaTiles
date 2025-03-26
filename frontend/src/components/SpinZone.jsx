import React from "react";
import { useDrop } from "react-dnd";

/** SpinZone represents the discardment area for unwanted tiles.
 * When a tile is dragged from the rack or board and dropped here, it is shuffled back into the pile
 * and replaced with 3 new random tiles (if available).
 *
 */

const SpinZone = ({ onSpin }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: "TILE",
        drop: (item) => {
            // Validates the origin, ID, and letter of the dropped tile to filter out erroneous drops
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
            className={`fixed bottom-5 right-5 z-[9999] w-20 h-20 flex items-center justify-center rounded-full border-2 shadow-xl transition-all duration-300
                ${isOver ? "bg-red-600 scale-110" : "bg-red-500"}`}
        >
            <span className="text-white text-lg font-bold">🗑️</span>
        </div>
    );
};

export default SpinZone;
