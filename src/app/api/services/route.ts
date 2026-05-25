import { NextResponse } from 'next/server'
import { getBulkFollowsClient } from '@/lib/bulkfollows'

export async function GET() {
  try {
    const client = getBulkFollowsClient()
    const services = await client.getServices()
    return NextResponse.json({ success: true, services })
  } catch (error) {
    console.error('Erro ao buscar serviços BulkFollows:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao carregar serviços' },
      { status: 500 }
    )
  }
}
