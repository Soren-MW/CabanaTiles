import React from "react";
import "./TileCounter.css";

const TileCounter = ({ pileCount, rackCount }) => {
    return (
        <div className="tile-counter-container">
            <div className="tile-counter-text">
                <div>Pile: {pileCount}</div>
                <div>Rack: {rackCount}</div>
            </div>
        </div>
    );
};

export default TileCounter;
