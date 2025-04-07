import React from "react";
import { Link } from "react-router-dom";
import CabanaTitle from "./CabanaTitle";
import SparkleOverlay from "./SparkleOverlay";
import "./LandingPage.css";

const LandingPage = () => {
    return (
        <div
            className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center gap-8 px-4 relative"
            style={{ backgroundImage: "url('/images/atomicMod.png')" }}
        >
            <SparkleOverlay />

            <CabanaTitle isOverlay={false} />

            <div className="flex gap-6 z-10">
                <Link to="/game" className="bn47">
                    Single Player
                </Link>
                <Link to="/how-to-play" className="bn47">
                    How to Play
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;
