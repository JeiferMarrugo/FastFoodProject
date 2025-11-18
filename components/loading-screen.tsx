"use client"

import { motion } from "framer-motion"

interface LoadingScreenProps {
  message?: string
  isVisible: boolean
}

export function LoadingScreen({ message = "Cargando...", isVisible }: LoadingScreenProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-8 flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <p className="text-lg font-semibold text-primary">{message}</p>
      </motion.div>
    </motion.div>
  )
}
