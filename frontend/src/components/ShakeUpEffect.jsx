import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ShakeUpEffect = ({ show = false, onComplete }) => {
    const letters = "ShakeUp".split("");

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="shakeup-text"
                    className="z-[9999] pointer-events-none flex gap-1"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 1.4 }}
                    onAnimationComplete={onComplete}
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    {letters.map((letter, i) => (
                        <motion.span
                            key={i}
                            animate={{
                                y: [0, i % 2 === 0 ? 8 : -8, 0],
                            }}
                            transition={{
                                duration: 0.4,
                                repeat: 3,
                                repeatType: "loop",
                                ease: "easeInOut",
                            }}
                            style={{
                                fontFamily: '"Fontdiner Swanky", cursive',
                                fontSize: "3.2rem",
                                fontWeight: "bold",
                                color: "#fff",
                                textShadow: "2px 2px 5px rgba(0, 0, 0, 0.4)",
                                filter: "drop-shadow(1px 3px 6px rgba(0,0,0,0.35))",
                                background:
                                    "linear-gradient(to top right, #74ebd5, #acb6e5)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShakeUpEffect;
