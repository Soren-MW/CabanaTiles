import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COUNT_SEQUENCE = ["3", "2", "1", "Go!"];

const CountdownOverlay = ({ onComplete }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        let timeout;
        if (index < COUNT_SEQUENCE.length) {
            timeout = setTimeout(() => {
                setIndex((prev) => prev + 1);
            }, 1600);
        } else {
            timeout = setTimeout(() => {
                onComplete?.();
            }, 600);
        }
        return () => clearTimeout(timeout);
    }, [index, onComplete]);

    return (
        <AnimatePresence mode="wait">
            {index < COUNT_SEQUENCE.length && (
                <motion.div
                    key={COUNT_SEQUENCE[index]}
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{ perspective: 1000 }}
                >
                    <motion.span
                        className="text-[15rem] font-extrabold"
                        style={{
                            fontFamily: '"Fontdiner Swanky", cursive',
                            color: "#f9d423",
                            textShadow:
                                "6px 6px 12px rgba(0, 0, 0, 0.8), -2px -2px 4px rgba(255,255,255,0.3)",
                            transformStyle: "preserve-3d",
                            opacity: 1,
                        }}
                        initial={{ rotateY: -180, scale: 0.4, opacity: 0 }}
                        animate={{ rotateY: 0, scale: 1.8, opacity: 1 }}
                        exit={{ rotateY: 180, scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                        {COUNT_SEQUENCE[index]}
                    </motion.span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CountdownOverlay;
