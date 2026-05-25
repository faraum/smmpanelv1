import { NextRequest, NextResponse } from 'next/server'
import { isPreviewMode, FAKE_ORDERS } from '@/lib/config'

export async function GET(req: NextRequest) {
  // ── MODO PREVIEW ─────────────────────────────────────────────────────────
  if (isPreviewMode) {
    return NextResponse.json({
      success: true,
      orders: FAKE_ORDERS,
      pagination: { page: 1, limit: 20, total: FAKE_ORDERS.length, pages: 1 },
      preview: true,
    })
  }

  // ── MODO PRODUÇÃO ─────────────────────────────────────────────────────────
  const adminPassword = req.headers.get('x-admin-password')
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { connectDB } = await import('@/lib/mongodb')
    const { default: Order } = await import('@/lib/models/Order')

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status

    await connectDB()

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select('-pixQrCode -pixCode')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Erro ao listar pedidos:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
