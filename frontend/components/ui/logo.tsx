"use client";

import { motion } from "framer-motion";

export function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center mb-6"
    >
      <div className="logo text-3xl">
        <span className="logo-gradient">Secure</span>
        <span>ID</span>
      </div>
    </motion.div>
  );
}
