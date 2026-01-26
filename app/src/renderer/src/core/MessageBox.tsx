import { useEffect } from 'react'

export function MessageBox() {
  useEffect(() => {
    window.api.listeners.onMessage((_, message) => {
      console.log('Received message in MessageBox:', message)
    })
  })
  return <section id="MessageBox" className="absolute! h-full w-full"></section>
}
