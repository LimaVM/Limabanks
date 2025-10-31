"use client"

import { useEffect, useState } from "react"

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 200, height = 60, className = "" }: LogoProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const src = isDark ? "/logo-dark.png" : "/logo-light.png"

  return (
    <img
      src={src}
      alt="LimaTech Logo"
      width={width}
      height={height}
      className={className}
      loading="eager"
    />
  )
}
