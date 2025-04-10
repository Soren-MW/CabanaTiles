import React from "react";
import Tile from "./Tile";

/**
 * TileRack represents the player's tile rack, where tiles are stored before players put them in play via React DnD.
 * Additional logic to prevent overdrawing (and subsequent visual cluttering) is being worked on.
 */
const TileRack = ({ tiles, onSpin, tileSize }) => {
    console.log(
        "RACK:",
        tiles.map((t) => t.id)
    );

    return (
        <div className="w-full border-b-2 border-white/30 backdrop-blur-sm bg-[rgba(0,0,0,0.2)] flex justify-center items-center h-full">
            <div className="flex flex-wrap justify-center gap-2 px-4">
                {tiles.map((tile, index) => (
                    <Tile
                        key={tile.id}
                        id={tile.id}
                        letter={tile.letter}
                        tileSize={tileSize}
                        origin="rack"
                        rackIndex={index}
                        isNew={tile.isNew}
                        onRightClick={() => onSpin({ ...tile, origin: "rack" })}
                    />
                ))}
            </div>
        </div>
    );
};

export default TileRack;
