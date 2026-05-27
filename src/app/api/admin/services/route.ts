import { NextResponse } from 'next/server'
import { getBulkFollowsClient } from '@/lib/bulkfollows'

export async function GET() {
  if (!process.env.BULKFOLLOWS_API_KEY) {
    return NextResponse.json({ error: 'BULKFOLLOWS_API_KEY não configurada' }, { status: 500 })
  }

  try {
    const client = getBulkFollowsClient()
    const services = await client.getServices()

    // Group by category, sort cheapest first within each group
    const grouped: Record<string, any[]> = {}
    for (const s of services) {
      const cat = s.category || 'Other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push({
        id: s.service,
        name: s.name,
        rate: parseFloat(s.rate as unknown as string),
        min: parseInt(s.min as unknown as string),
        max: parseInt(s.max as unknown as string),
        type: s.type,
      })
    }

    for (const cat in grouped) {
      grouped[cat].sort((a, b) => a.rate - b.rate)
    }

    return NextResponse.json({ total: services.length, categories: grouped })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
