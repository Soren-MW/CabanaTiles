import React from "react";
import "./SparkleOverlay.css";

const sparkleAssets = [
    "/images/sparkles/sparkle_yellow.svg",
    "/images/sparkles/sparkle_pink.svg",
    "/images/sparkles/sparkle_red.svg",
    "/images/sparkles/sparkle_orange.svg",
    "/images/sparkles/sparkle_blue.svg",
    "/images/sparkles/sparkle_purple.svg",
    "/images/sparkles/sparkle_green.svg",
];

const staticPositions = [
    { top: "10%", left: "15%" },
    { top: "20%", left: "80%" },
    { top: "30%", left: "30%" },
    { top: "40%", left: "70%" },
    { top: "55%", left: "25%" },
    { top: "65%", left: "65%" },
    { top: "75%", left: "40%" },
    { top: "85%", left: "80%" },
    { top: "15%", left: "50%" },
    { top: "60%", left: "10%" },
    { top: "25%", left: "60%" },
    { top: "70%", left: "85%" },
];

const SparkleOverlay = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            {staticPositions.map((pos, i) => (
                <img
                    key={i}
                    src={sparkleAssets[i % sparkleAssets.length]}
                    alt={`sparkle-${i}`}
                    className="sparkle"
                    style={{
                        top: pos.top,
                        left: pos.left,
                        animationDelay: `${i * 0.5}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default SparkleOverlay;
