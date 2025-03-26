import React from "react";
import Tile from "./Tile";

/**
 * TileRack represents the player's tile rack, where tiles are stored before players put them in play via React DnD.
 * The component is made to accommodate tile quantities much larger than the initial 21-tile starting amount.
 * The rack is balanced to be as visually unobstructive as possible while still having a large capacity.
 */
const TileRack = ({ tiles, onSpin }) => {
    return (
        <div className="w-full max-w-none transition-all duration-300 ease-in-out flex flex-col items-center">
            {/* A container for tile pieces meant to emulate Scrabble racks, */}
            <div className="flex flex-wrap justify-center gap-2 p-3 rounded-xl bg-white/30 backdrop-blur-md shadow-inner border border-white/60 ring-1 ring-white/50">
                {tiles.map((tile, index) => (
                    <Tile
                        key={tile.id}
                        id={tile.id}
                        letter={tile.letter}
                        origin="rack"
                        rackIndex={index}
                        isNew={tile.isNew}
                    />
                ))}
            </div>
        </div>
    );
};

export default TileRack;
