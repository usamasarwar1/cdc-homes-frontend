import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook to detect if the current viewport is mobile size
 * Returns true for screens smaller than 768px
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => {
    // Initialize with actual value to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
