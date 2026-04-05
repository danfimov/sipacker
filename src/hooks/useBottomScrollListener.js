import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook to detect when user scrolls to the bottom of a container
 * Replacement for react-bottom-scroll-listener package
 *
 * @param {Function} onBottom - Callback function to call when bottom is reached
 * @param {Object} options - Configuration options
 * @param {number} options.offset - Offset in pixels from bottom to trigger (default: 0)
 * @param {number} options.debounce - Debounce delay in ms (default: 200)
 * @param {boolean} options.disabled - Whether to disable the listener (default: false)
 * @returns {Function} ref - Ref to attach to the scrollable element
 */
export function useBottomScrollListener(onBottom, options = {}) {
  const { offset = 0, debounce = 200, disabled = false } = options

  const containerRef = useRef(null)
  const onBottomRef = useRef(onBottom)
  const timeoutRef = useRef(null)

  // Keep callback ref up to date
  useEffect(() => {
    onBottomRef.current = onBottom
  }, [onBottom])

  const handleScroll = useCallback(() => {
    if (disabled || !containerRef.current) {
      return
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce the scroll event
    timeoutRef.current = setTimeout(() => {
      const container = containerRef.current
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      // Check if we've reached the bottom (with offset)
      if (distanceFromBottom <= offset) {
        onBottomRef.current?.()
      }
    }, debounce)
  }, [disabled, offset, debounce])

  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) {
      return
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleScroll, disabled])

  return containerRef
}

export default useBottomScrollListener
