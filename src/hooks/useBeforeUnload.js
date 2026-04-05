import { useEffect, useRef } from 'react'

/**
 * Hook to show a confirmation dialog before the user leaves the page
 * Replacement for react-beforeunload package
 *
 * @param {boolean} enabled - Whether to enable the beforeunload prompt
 * @param {string} message - Optional message (note: most browsers ignore custom messages)
 */
export function useBeforeUnload(
  enabled = true,
  message = 'You have unsaved changes. Are you sure you want to leave?'
) {
  const enabledRef = useRef(enabled)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    const handleBeforeUnload = event => {
      if (!enabledRef.current) {
        return
      }

      // Modern browsers ignore returnValue and show their own message
      event.preventDefault()
      event.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [message])
}

export default useBeforeUnload
