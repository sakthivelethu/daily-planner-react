import { motion } from "framer-motion";

export function Loader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="relative flex items-center justify-center">
        {/* The 'D' Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-4xl font-bold text-white shadow-xl shadow-primary/20 font-display"
        >
          D
        </motion.div>
        
        {/* Subtle pulsing ring */}
        <div className="loader-ring absolute inset-0 -z-0 h-16 w-16 rounded-2xl bg-primary/20 blur-xl" />
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
