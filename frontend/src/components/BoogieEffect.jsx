import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const BoogieEffect = ({ show = false, onComplete }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="boogie-text"
                    className="z-[9999] pointer-events-none"
                    initial={{ opacity: 0, scale: 0.5, rotate: -10, y: 20 }}
                    animate={{
                        opacity: 1,
                        scale: [1.3, 1.5, 1.2],
                        rotate: [0, 5, -5, 0],
                        y: [20, 0, -10],
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: -30 }}
                    transition={{
                        duration: 1.4,
                        ease: "easeInOut",
                        times: [0, 0.3, 0.6, 1],
                    }}
                    onAnimationComplete={onComplete}
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontFamily: '"Fontdiner Swanky", cursive',
                        fontSize: "4rem",
                        fontWeight: "bold",
                        background:
                            "linear-gradient(to right, #ff6ec4, #7873f5)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.9)",
                        filter: "drop-shadow(3px 5px 8px rgba(0,0,0,0.5))",
                    }}
                >
                    Boogie!
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BoogieEffect;
