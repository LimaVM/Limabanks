"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 200, height = 60, className = "" }: LogoProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Verificar tema inicial
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    checkTheme()

    // Observer para mudanças no tema
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <Image
      src={isDark ? "/logo-dark.png" : "/logo-light.png"}
      alt="LimaTech Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
