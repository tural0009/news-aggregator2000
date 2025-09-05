import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { motion } from 'framer-motion'
const inter = Inter({ subsets: ['latin'] })

type Item = { source:string; title:string; link:string; pubDate:string }

function timeAgo(iso: string) {
  const d = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - d)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'indi'
  if (mins < 60) return `${mins} dəq əvvəl`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} saat əvvəl`
  const days = Math.floor(hrs / 24)
  return `${days} gün əvvəl`
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [source, setSource] = useState('Hamısı')
  const [tick, setTick] = useState(60)

  async function load() {
    try {
      setLoading(true)
      const r = await fetch('/api/news')
      const data: Item[] = await r.json()
      setItems(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false); setTick(60) }
  }

  useEffect(() => {
    load()
    const t = setInterval(() => setTick((x) => (x > 0 ? x - 1 : 0)), 1000)
    const auto = setInterval(load, 60000)
    return () => { clearInterval(t); clearInterval(auto) }
  }, [])

  function toggleTheme() {
    const cls = document.documentElement.classList
    const isDark = cls.contains('dark')
    cls.toggle('dark')
    try { localStorage.setItem('theme', isDark ? 'light' : 'dark') } catch {}
  }

  const sources = useMemo(() => ['Hamısı', ...Array.from(new Set(items.map((i) => i.source)))], [items])
  const view = useMemo(() => items.filter((i) => {
    if (source !== 'Hamısı' && i.source !== source) return false
    if (q && !i.title.toLowerCase().includes(q.toLowerCase())) return false
    return true
  }), [items, q, source])

  return (
    <div className={inter.className}>
      <Head><title>Xəbər Başlıqları</title></Head>
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 dark:bg-[#0b0f14]/70 border-b">
        <div className="container py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Xəbər Başlıqları</h1>
          <div className="flex gap-2 items-center">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Axtarış…" className="input w-56" />
            <select value={source} onChange={(e) => setSource(e.target.value)} className="select">{sources.map((s) => (<option key={s} value={s}>{s}</option>))}</select>
            <button onClick={load} className="btn">Yenilə</button>
            <span className="text-xs muted">auto: {tick}s</span>
            <button onClick={toggleTheme} className="btn">Dark</button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {loading && (<div className="text-sm muted mb-3 animate-pulse">Yüklənir…</div>)}
        <ul className="space-y-3">
          {view.map((i, idx) => (
            <li key={i.link + idx} className="card p-4 hover:shadow-soft transition">
              <a href={i.link} target="_blank" rel="noreferrer" className="block">
                <div className="text-sm muted flex gap-2">
                  <span className="font-medium">{i.source}</span><span>•</span><span>{timeAgo(i.pubDate)}</span>
                </div>
                <motion.h2 whileHover={{ scale: 1.01 }} className="mt-1 text-lg font-semibold leading-snug">{i.title}</motion.h2>
              </a>
            </li>
          ))}
        </ul>
        {!loading && view.length === 0 && (<div className="text-sm muted">Heç nə tapılmadı.</div>)}
      </main>

      <footer className="container py-10 text-xs muted">© {new Date().getFullYear()} — Sənin domenin.</footer>
    </div>
  )
}
