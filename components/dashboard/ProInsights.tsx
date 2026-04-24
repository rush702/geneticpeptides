'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  vendorId: string
  vendorName: string
  tier: 'free' | 'pro' | 'enterprise'
}

interface ScoreBreakdown {
  purity: number
  coa_count: number
  community: number
  sentiment: number
  service: number
  total: number
}

interface ClickStats {
  last_30_days: number
  last_7_days: number
  today: number
}

interface CompetitorRank {
  rank: number
  total: number
  above: string[]
  below: string[]
}

interface SentimentItem {
  text: string
  score: number
  source: string
  created_at: string
}

interface COAStatus {
  verified: number
  pending: number
  missing: number
  total: number
  latest_upload: string | null
}

export default function ProInsights({ vendorId, vendorName, tier }: Props) {
  const supabase = createClient()
  const isPro = tier === 'pro' || tier === 'enterprise'

  const [score, setScore] = useState<ScoreBreakdown | null>(null)
  const [clicks, setClicks] = useState<ClickStats | null>(null)
  const [rank, setRank] = useState<CompetitorRank | null>(null)
  const [sentiment, setSentiment] = useState<SentimentItem[]>([])
  const [coa, setCoa] = useState<COAStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPro) { setLoading(false); return }
    loadAll()
  }, [vendorId])

  async function loadAll() {
    setLoading(true)
    await Promise.allSettled([loadScore(), loadClicks(), loadRank(), loadSentiment(), loadCOA()])
    setLoading(false)
  }

  async function loadScore() {
    const { data } = await supabase.from('vendors').select('pvs_score,purity_score,coa_score,community_score,sentiment_score,service_score').eq('id',vendorId).single()
    if (data) setScore({ purity: data.purity_score??0, coa_count: data.coa_score??0, community: data.community_score??0, sentiment: data.sentiment_score??0, service: data.service_score??0, total: data.pvs_score??0 })
  }

  async function loadClicks() {
    const now = new Date(), d30 = new Date(now); d30.setDate(d30.getDate()-30)
    const d7 = new Date(now); d7.setDate(d7.getDate()-7)
    const today = new Date(now); today.setHours(0,0,0,0)
    const { data } = await supabase.from('vendor_clicks').select('clicked_at').eq('vendor_id',vendorId).gte('clicked_at',d30.toISOString())
    if (data) setClicks({ last_30_days: data.length, last_7_days: data.filter((r: any)=>new Date(r.clicked_at)>=d7).length, today: data.filter((r: any)=>new Date(r.clicked_at)>=today).length })
  }

  async function loadRank() {
    const { data } = await supabase.from('vendors').select('id,name,pvs_score').order('pvs_score',{ascending:false}).limit(100)
    if (data) { const i = data.findIndex((v: any)=>v.id===vendorId); setRank({ rank: i+1, total: data.length, above: data.slice(Math.max(0,i-2),i).map((v: any)=>v.name), below: data.slice(i+1,i+3).map((v: any)=>v.name) }) }
  }

  async function loadSentiment() {
    const { data } = await supabase.from('vendor_sentiment').select('text,score,source,created_at').eq('vendor_id',vendorId).order('created_at',{ascending:false}).limit(5)
    if (data) setSentiment(data)
  }

  async function loadCOA() {
    const { data } = await supabase.from('coa_documents').select('status,uploaded_at').eq('vendor_id',vendorId)
    if (data) { const sorted = data.sort((a: any,b: any)=>new Date(b.uploaded_at).getTime()-new Date(a.uploaded_at).getTime()); setCoa({ verified: data.filter((d: any)=>d.status==='verified').length, pending: data.filter((d: any)=>d.status==='pending').length, missing: 0, total: data.length, latest_upload: sorted[0]?.uploaded_at??null }) }
  }

  if (!isPro) return (
    <div className="bg-gradient-to-br from-teal-900/40 to-teal-800/20 border border-teal-700/40 rounded-xl p-6 text-center">
      <p className="text-teal-300 font-semibold mb-1">👬 Pro Insights</p>
      <p className="text-gray-400 text-sm mb-4">Upgrade to Pro to unlock score breakdowns, buyer visibility, competitor benchmarks, Reddit sentiment, and COA status.</p>
      <a href="/for-vendors#pricing" className="inline-block bg-teal-500 hover:bv-teal-400 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Upgrade to Pro &#8204; $299/mo</a>
    </div>
  )

  if (loading) return <div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />

  return (
    <div className="space-y-6">
      {score && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><span className="text-teal-400">📇</span> PVS Score Breakdown<span className="ml-auto text-3xl font-bold text-teal-400">{score.total}</span></h3>
          <div className="space-y-3">
            {[{ label: 'Purity / Lab Results', value: score.purity, color: 'bg-teal-500', max: 40 },{ label: 'COA Coverage', value: score.coa_count, color: 'bg-blue-500', max: 25 },{ label: 'Community Score', value: score.community, color: 'bg-purple-500', max: 15 },{ label: 'Reddit Sentiment', value: score.sentiment, color: 'bg-orange-500', max: 10 },{ label: 'Customer Service', value: score.service, color: 'bg-pink-500', max: 10 }].map(({ label, value, color, max }) => (
              <div key={label}><div className="flex justify-between text-sm mb-1"><span className="text-gray-300">{label}</span><span className="text-white font-medium">{value} / {max}</span></div><div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${(value/max)*100}%` }} /></div></div>
            ))}
          </div>
        </div>
      )}
      {clicks && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4"><span className="text-blue-400">👌</span> Buyer Visibility</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[{ label: 'Today', value: clicks.today },{ label: 'Last 7 days', value: clicks.last_7_days },{ label: 'Last 30 days', value: clicks.last_30_days }].map(({ label, value }) => (
              <div key={label} className="bg-gray-800 rounded-lg p4"><p className="text-2xl font-bold text-white">{value}</p><p className="text-gray-400 text-xs mt-1">{label}</p></div>
            ))}
          </div>
        </div>
      )}
      {rank && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4"><span className="text-yellow-400">🏆</span> Competitor Benchmark</h3>
          <div className="text-center mb-4"><p className="text-5xl font-bold text-white">#{ rank.rank }</p><p className="text-gray-400 text-sm mt-1">out of {rank.total} vendors</p></div>
          <div className="space-y-2">
            {rank.above.map(n => <div key={n} className="flex items-center gap-2 text-sm text-gray-400"><span className="text-red-400">↑</span> {n} (ranked above you)</div>)}
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-300 bg-teal-900/30 px-3 py-2 rounded-lg"><span>→</span> {vendorName} (you)</div>
            {rank.below.map(n => <div key={n} className="flex items-center gap-2 text-sm text-gray-400"><span className="text-green-400">↓</span> {n} (ranked below you)</div>)}
          </div>
        </div>
      )}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4"><span className="text-orange-400">💮</span> Recent Reddit Mentions</h3>
        {sentiment.length === 0 ? <p className="text-gray-500 text-sm">No recent mentions. Our BERT model scans Reddit daily.</p> : sentiment.map((item, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-3 mb-3"><div className="flex items-start justify-between gap-2"><p className="text-gray-300 text-sm flex-1">"{item.text}"</p><span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${item.score>0.6?'bg-green-900 text-green-300':item.score<0.4?'bg-red-900 text-red-300':'bg-gray-700 text-gray-300'}`}>{item.score>0.6?'+ Positive':item.score<0.4?'✂ Negative':'�~ Neutral'}</span></div></div>
        ))}
      </div>
      {coa && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4"><span className="text-green-400">🧪</span> COA Verification Status</h3>
          <div className="mb-4"><div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Verified COAs</span><span className="text-white font-medium">{coa.verified} / {coa.total}</span></div><div className="h-3 bg-gray-700 rounded-full overflow-hidden flex"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: coa.total?`${(coa.verified/coa.total)*100}%`:'0%' }} /><div className="h-full bg-yellow-500" style={{ width: coa.total?`${(coa.pending/coa.total)*100}%`:'0%' }} /></div><div className="flex gap-4 mt-2 text-xs"><span className="text-green-400">● {coa.verified} verified</span><span className="text-yellow-400">● {coa.pending} pending</span></div></div>
          <a href="/dashboard/coa" className="mt-4 inline-block text-sm text-teal-400 hover:text-teal-300 underline">Upload more COAs →</a>
        </div>
      )}
    </div>
  )
}
