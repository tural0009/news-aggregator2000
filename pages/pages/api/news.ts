import type { NextApiRequest, NextApiResponse } from 'next'
import Parser from 'rss-parser'

type Item = { source: string; title: string; link: string; pubDate: string }

const FEEDS: { source: string; url: string }[] = [
  { source: 'Oxu.az',        url: 'https://oxu.az/rss' },
  { source: 'Report.az',     url: 'https://report.az/rss' },
  { source: 'APA',           url: 'https://apa.az/rss' },
  { source: 'Trend.az',      url: 'https://az.trend.az/rss' },
  { source: 'Qafqazinfo.az', url: 'https://qafqazinfo.az/rss.php' },
  { source: 'Lent.az',       url: 'https://lent.az/rss' },
  { source: 'Publika.az',    url: 'https://publika.az/rss' },
  { source: 'Milli.az',      url: 'https://news.milli.az/rss/' },
  { source: 'Minval.az',     url: 'https://minval.az/feed' },
  { source: 'Musavat.com',   url: 'https://musavat.com/rss.php' }
]

let cache: { ts: number; data: Item[] } = { ts: 0, data: [] }
const CACHE_MS = 60 * 1000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')
  const now = Date.now()
  if (now - cache.ts < CACHE_MS && cache.data.length) return res.status(200).json(cache.data)

  const parser = new Parser({ timeout: 10000 }) as Parser<any, any>
  const items: Item[] = []

  await Promise.all(FEEDS.map(async (f) => {
    try {
      const feed = await parser.parseURL(f.url)
      for (const it of feed.items || []) {
        const link: string = (it.link as string) || (it.guid as string) || ''
        if (!link) continue
        const title: string = (it.title as string || '').trim()
        const pubDate: string = (it.isoDate as string) || (it.pubDate as string) || new Date().toISOString()
        items.push({ source: f.source, title, link, pubDate })
      }
    } catch (e) { console.error('Feed error:', f.url, e) }
  }))

  const seen = new Set<string>()
  const unique = items.filter((i) => { if (seen.has(i.link)) return false; seen.add(i.link); return true })
  unique.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  const data = unique.slice(0, 150)
  cache = { ts: now, data }
  return res.status(200).json(data)
}
