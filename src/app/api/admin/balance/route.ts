import { NextRequest, NextResponse } from 'next/server'
import { isPreviewMode, FAKE_ORDERS } from '@/lib/config'
import { formatBRL } from '@/lib/utils'

export async function GET(req: NextRequest) {
  // ── MODO PREVIEW ─────────────────────────────────────────────────────────
  if (isPreviewMode) {
    const totalRevenueBRL = FAKE_ORDERS
      .filter((o) => ['PAID', 'PROCESSING', 'COMPLETED'].includes(o.status))
      .reduce((sum, o) => sum + o.priceBRL, 0)

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: FAKE_ORDERS.length,
        todayOrders: FAKE_ORDERS.length,
        pendingOrders: FAKE_ORDERS.filter((o) => o.status === 'PENDING_PAYMENT').length,
        completedOrders: FAKE_ORDERS.filter((o) => o.status === 'COMPLETED').length,
        totalRevenueBRL,
        bulkBalance: '150.00',
        bulkCurrency: 'USD',
      },
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
    const { getBulkFollowsClient } = await import('@/lib/bulkfollows')

    await connectDB()

    let bulkBalance = null
    try {
      const client = getBulkFollowsClient()
      bulkBalance = await client.getBalance()
    } catch (e) {
      console.error('Erro ao buscar saldo BulkFollows:', e)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalOrders, todayOrders, pendingOrders, completedOrders, revenueAgg] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.countDocuments({ status: 'PENDING_PAYMENT' }),
        Order.countDocuments({ status: 'COMPLETED' }),
        Order.aggregate([
          { $match: { status: { $in: ['PAID', 'PROCESSING', 'COMPLETED'] } } },
          { $group: { _id: null, total: { $sum: '$priceBRL' } } },
        ]),
      ])

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        pendingOrders,
        completedOrders,
        totalRevenueBRL: revenueAgg[0]?.total || 0,
        bulkBalance: bulkBalance?.balance,
        bulkCurrency: bulkBalance?.currency,
      },
    })
  } catch (error) {
    console.error('Erro no admin/balance:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
