import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import { useEffect } from 'react'

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || (!stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch {}
  }, [])
  return <Component {...pageProps} />
}
