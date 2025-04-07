import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./CabanaTitle.css";

const WIN_LETTERS = ["Y", "O", "U", " ", "W", "I", "N", "!"];

const tileColors = [
    "#e74c3c",
    "#f39c12",
    "#2ecc71",
    "transparent",
    "#3498db",
    "#9b59b6",
    "#1abc9c",
    "#ec407a",
];

const WinOverlay = ({ show, onComplete }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="win-overlay"
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    style={{ backgroundColor: "black" }}
                >
                    <div className="flex gap-2">
                        {WIN_LETTERS.map((letter, index) => (
                            <motion.div
                                key={index}
                                className="letter-tile"
                                style={{
                                    backgroundColor:
                                        letter === " "
                                            ? "transparent"
                                            : tileColors[index],
                                    top: index % 2 === 0 ? "0rem" : "0.5rem",
                                }}
                                initial={{ y: -150, opacity: 0, scale: 0.6 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -100, opacity: 0 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.2,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                }}
                            >
                                {letter !== " " ? (
                                    letter
                                ) : (
                                    <span style={{ width: "1rem" }} />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WinOverlay;
