"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

const supabase = createClient()

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [pointsEarned, setPointsEarned] = useState(0)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const birdImageRef = useRef<HTMLImageElement | null>(null)

  const gameStateRef = useRef({
    bird: { x: 50, y: 150, width: 20, height: 20, velocity: 0 },
    pipes: [] as { x: number; y: number; width: number; height: number; scored: boolean }[],
    score: 0,
    gameRunning: false,
  })

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "/bird.png"
    birdImageRef.current = img
  }, [])

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [])

  useEffect(() => {
    if (!gameStarted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const gravity = 0.5
    const pipeGap = 120
    const pipeWidth = 60
    let pipeCounter = 0

    gameStateRef.current = {
      bird: { x: 50, y: 150, width: 25, height: 25, velocity: 1 },
      pipes: [],
      score: 0,
      gameRunning: true,
    }

    const handleJump = () => {
      gameStateRef.current.bird.velocity = -10
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        handleJump()
      }
    }

    const handleCanvasClick = () => {
      handleJump()
    }

    const handleTouchStart = () => {
      handleJump()
    }

    window.addEventListener("keydown", handleKeyPress)
    canvas.addEventListener("click", handleCanvasClick)
    canvas.addEventListener("touchstart", handleTouchStart)

    gameLoopRef.current = setInterval(() => {
      const state = gameStateRef.current

      // Aplicar gravedad
      state.bird.velocity += gravity
      state.bird.y += state.bird.velocity

      // Generar tuberías
      pipeCounter++
      if (pipeCounter > 90) {
        const pipeY = Math.random() * (canvas.height - pipeGap - 100) + 50
        state.pipes.push({
          x: canvas.width,
          y: 0,
          width: pipeWidth,
          height: pipeY,
          scored: false,
        })
        state.pipes.push({
          x: canvas.width,
          y: pipeY + pipeGap,
          width: pipeWidth,
          height: canvas.height - pipeY - pipeGap,
          scored: false,
        })
        pipeCounter = 0
      }

      // Mover tuberías
      state.pipes = state.pipes.filter((pipe) => pipe.x > -pipeWidth)
      state.pipes.forEach((pipe) => {
        pipe.x -= 5

        // Verificar colisión
        if (
          state.bird.x < pipe.x + pipe.width &&
          state.bird.x + state.bird.width > pipe.x &&
          state.bird.y < pipe.y + pipe.height &&
          state.bird.y + state.bird.height > pipe.y
        ) {
          endGame(state.score)
        }
      })

      state.pipes.forEach((pipe) => {
        if (!pipe.scored && pipe.y === 0 && pipe.x + pipeWidth < state.bird.x) {
          state.score += 1
          setScore(state.score)
          pipe.scored = true
        }
      })


      // Límites del canvas
      if (state.bird.y + state.bird.height > canvas.height || state.bird.y < 0) {
        endGame(state.score)
      }

      // Dibujar
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (birdImageRef.current && birdImageRef.current.complete) {
        ctx.drawImage(birdImageRef.current, state.bird.x, state.bird.y, state.bird.width, state.bird.height)
      } else {
        // Fallback si la imagen no carga
        ctx.fillStyle = "#fbbf24"
        ctx.fillRect(state.bird.x, state.bird.y, state.bird.width, state.bird.height)
      }

      // Dibujar tuberías
      ctx.fillStyle = "#1f2937"
      state.pipes.forEach((pipe) => {
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height)
      })

      // Dibujar score
      ctx.fillStyle = "#1f2937"
      ctx.font = "24px Arial"
      ctx.fillText(`Score: ${state.score}`, 10, 30)
    }, 1000 / 60)

    const endGame = async (finalScore: number) => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      window.removeEventListener("keydown", handleKeyPress)
      canvas.removeEventListener("click", handleCanvasClick)
      canvas.removeEventListener("touchstart", handleTouchStart)
      setGameOver(true)

      const earnedPoints = finalScore * 5
      setPointsEarned(earnedPoints)

      try {
        const authResponse = await supabase.auth.getUser()
        const user = authResponse?.data?.user

        if (!user) {
          console.error("No user found")
          return
        }

        // Upsert seguro: si ya existe la fila se suma, si no se crea
        const { data, error } = await supabase
          .from("user_points")
          .select("points")
          .eq("user_id", user.id)
          .single()

        if (error && error.code !== "PGRST116") { // PGRST116 = no rows found
          console.error("Error fetching points:", error)
          return
        }

        const currentPoints = data?.points ?? 0
        const newPoints = currentPoints + earnedPoints

        const { error: updateError } = await supabase
          .from("user_points")
          .upsert({ user_id: user.id, points: newPoints }, { onConflict: "user_id" })

        if (updateError) {
          console.error("Error updating/inserting points:", updateError)
          return
        }

        console.log("Puntos actualizados:", newPoints)
      } catch (error) {
        console.error("Error saving points:", error)
      }
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      window.removeEventListener("keydown", handleKeyPress)
      canvas.removeEventListener("click", handleCanvasClick)
      canvas.removeEventListener("touchstart", handleTouchStart)
    }
  }, [gameStarted])

  const handlePlayAgain = () => {
    setGameOver(false)
    setScore(0)
    setPointsEarned(0)
    setGameStarted(false)
    // Dar tiempo para que el useEffect limpie antes de reiniciar
    setTimeout(() => setGameStarted(true), 100)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary-foreground cursor-pointer">Rapid Food G.A</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Flappy Bird - Gana Puntos</h2>

        <Card className="border-border mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <canvas
                ref={canvasRef}
                width={400}
                height={600}
                className="border-2 border-primary bg-white w-full max-w-md"
              />

              <div className="text-center">
                {!gameStarted && !gameOver && (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">Presiona ESPACIO o toca la pantalla para saltar</p>
                    <Button
                      onClick={() => setGameStarted(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Comenzar Juego
                    </Button>
                  </div>
                )}

                {gameOver && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">¡Juego Terminado!</p>
                      <p className="text-xl font-semibold my-2">Puntuación: {score}</p>
                      <p className="text-lg text-green-600 font-semibold mb-4">Puntos ganados: +{pointsEarned}</p>
                    </div>
                    <Button
                      onClick={handlePlayAgain}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Jugar de Nuevo
                    </Button>
                    <Link href="/games">
                      <Button variant="outline" className="w-full border-primary text-primary bg-transparent">
                        Volver a Juegos
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
