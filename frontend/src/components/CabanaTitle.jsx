import React from "react";
import "./CabanaTitle.css";

const CabanaTitle = ({ isOverlay = false }) => {
    return (
        <div
            className={
                isOverlay
                    ? "cabana-title-container"
                    : "flex flex-col items-center gap-1 scale-100 mb-4"
            }
        >
            <div className="title-tiles">
                <div className="letter-tile">C</div>
                <div className="letter-tile">A</div>
                <div className="letter-tile">B</div>
                <div className="letter-tile">A</div>
                <div className="letter-tile">N</div>
                <div className="letter-tile">A</div>
            </div>
            <div className="title-subtext">Tiles</div>
        </div>
    );
};

export default CabanaTitle;
