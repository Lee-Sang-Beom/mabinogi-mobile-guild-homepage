'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { Sword } from 'lucide-react'
import { getJobClassColor, JobClassIcons } from '@/app/(auth)/dashboard/job-class-utils'

interface Member {
  id: number
  name: string
  level: number
  jobClass: string
  joinDate: string
  avatar: string
  contribution: number
}

interface GuildMemberBubbleProps {
  members: Member[]
  setSelectedMemberAction: Dispatch<SetStateAction<Member | null>>
}

export function GuildMemberBubble({ members, setSelectedMemberAction }: GuildMemberBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [positions, setPositions] = useState<{ x: number; y: number; scale: number; rotation: number }[]>([])
  const [connections, setConnections] = useState<{ from: number; to: number; opacity: number }[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<{ x: number; y: number; width: number; height: number; delay: number }[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && containerSize.width > 0 && containerSize.height > 0) {
      const newParticles = Array.from({ length: 20 }).map(() => ({
        x: Math.random() * containerSize.width,
        y: Math.random() * containerSize.height,
        width: 4 + Math.random() * 8,
        height: 4 + Math.random() * 8,
        delay: Math.random() * 5,
      }))
      setParticles(newParticles)
    }
  }, [isClient, containerSize])

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0 || !isClient) return

    const centerX = containerSize.width / 2
    const centerY = containerSize.height / 2

    const newPositions = members.map((_, index) => {
      let x, y

      if (index % 3 === 0) {
        const angle = (index / (members.length / 3)) * Math.PI * 2
        const radius = Math.min(centerX, centerY) * 0.85
        x = centerX + Math.cos(angle) * radius * (0.7 + Math.random() * 0.3)
        y = centerY + Math.sin(angle) * radius * (0.7 + Math.random() * 0.3)
      } else if (index % 3 === 1) {
        const gridSize = Math.ceil(Math.sqrt(members.length))
        const gridX = index % gridSize
        const gridY = Math.floor(index / gridSize)
        const cellWidth = containerSize.width / gridSize
        const cellHeight = containerSize.height / gridSize

        x = gridX * cellWidth + cellWidth * 0.3 + Math.random() * cellWidth * 0.4
        y = gridY * cellHeight + cellHeight * 0.3 + Math.random() * cellHeight * 0.4
      } else {
        const padding = 50
        x = padding + Math.random() * (containerSize.width - padding * 2)
        y = padding + Math.random() * (containerSize.height - padding * 2)
      }

      const scale = 0.8 + Math.random() * 0.4
      const rotation = Math.random() * 10 - 5

      return { x, y, scale, rotation }
    })

    const bubbleSize = 40
    const minDistance = bubbleSize * 1.2

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < newPositions.length; j++) {
        for (let k = j + 1; k < newPositions.length; k++) {
          const dx = newPositions[j].x - newPositions[k].x
          const dy = newPositions[j].y - newPositions[k].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < minDistance) {
            const force = ((minDistance - distance) / distance) * 0.5
            newPositions[j].x += dx * force
            newPositions[j].y += dy * force
            newPositions[k].x -= dx * force
            newPositions[k].y -= dy * force

            newPositions[j].x = Math.max(bubbleSize / 2, Math.min(containerSize.width - bubbleSize / 2, newPositions[j].x))
            newPositions[j].y = Math.max(bubbleSize / 2, Math.min(containerSize.height - bubbleSize / 2, newPositions[j].y))
            newPositions[k].x = Math.max(bubbleSize / 2, Math.min(containerSize.width - bubbleSize / 2, newPositions[k].x))
            newPositions[k].y = Math.max(bubbleSize / 2, Math.min(containerSize.height - bubbleSize / 2, newPositions[k].y))
          }
        }
      }
    }

    setPositions(newPositions)

    const newConnections: { from: number; to: number; opacity: number }[] = []
    members.forEach((member, i) => {
      members.forEach((otherMember, j) => {
        if (i !== j && member.jobClass === otherMember.jobClass) {
          if (Math.random() > 0.7) {
            newConnections.push({
              from: i,
              to: j,
              opacity: 0.1 + Math.random() * 0.2,
            })
          }
        }
      })
    })
    setConnections(newConnections)

    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [members.length, containerSize, isClient])

  const bindDrag = useDrag(
    ({ args: [index], active, delta: [dx, dy] }) => {

      if (active) {
        setPositions((prev) => {
          const updated = [...prev]
          updated[index] = {
            ...updated[index],
            x: updated[index].x + dx,
            y: updated[index].y + dy,
          }
          return updated
        })
      }
    },
    { filterTaps: true, bounds: containerRef },
  )

  const renderConnectionLines = () => {
    if (!isInitialized || !isClient || positions.length === 0) return null

    return connections.map((connection, index) => {
      const from = positions[connection.from]
      const to = positions[connection.to]
      if (!from || !to) return null

      return (
        <motion.line
          key={`connection-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: connection.opacity }}
          x1={from.x + 20}
          y1={from.y + 20}
          x2={to.x + 20}
          y2={to.y + 20}
          transition={{ duration: 1, delay: 0.5 + index * 0.01 }}
          stroke={getJobClassColor(members[connection.from].jobClass)}
          strokeWidth={1}
          strokeDasharray="3,3"
          filter="url(#glow)"
        />
      )
    })
  }

  const handleMemberClick = (member: Member) => setSelectedMemberAction(member)

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {renderConnectionLines()}
      </svg>

      {/* Member Bubbles */}
      {positions.map((pos, index) => {
        const member = members[index]
        const color = getJobClassColor(member.jobClass)
        const Icon = JobClassIcons[member.jobClass] || Sword

        return (
          <div
            {...bindDrag(index)}
            key={member.id}
            className="absolute z-10 cursor-pointer"
            style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale}) rotate(${pos.rotation}deg)` }}
          >
            <motion.div
              onClick={() => handleMemberClick(member)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: color }}
              whileHover={{
                scale: pos.scale * 1.3,
                zIndex: 20,
                transition: { duration: 0.2 },
                backgroundImage: `linear-gradient(135deg, ${color}, #ffffff30)`,
              }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          </div>
        )
      })}

      {/* Background Particles */}
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full bg-white opacity-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2, delay: p.delay }}
          style={{
            top: p.y,
            left: p.x,
            width: p.width,
            height: p.height,
          }}
        />
      ))}
    </div>
  )
}
