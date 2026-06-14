// resources/js/Pages/Admin/Dashboard.tsx (cuplikan)
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { ReactNode } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Cards = {
    revenue_this_month: number
    revenue_total: number
    orders_total: number
    orders_pending: number
    books_available: number
    books_sold: number
}

type SalesPoint = { month: string; revenue: number; orders: number }
type TopBook = { title: string; sold_qty: number; revenue: number }
type LowStockBook = { id: number; title: string; stock: number; slug: string }
type RecentOrder = { id: number; order_number: string; status: string }

type DashboardProps = {
    cards: Cards
    salesChart: SalesPoint[]
    topBooks: TopBook[]
    lowStock: LowStockBook[]
    recentOrders: RecentOrder[]
}

const rupiah = (n?: ValueType | undefined) =>
    n == null ? '' : 'Rp' + Number(n).toLocaleString('id-ID')

export default function Dashboard({ cards, salesChart, topBooks, lowStock, recentOrders }: DashboardProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card label="Pendapatan Bulan Ini" value={rupiah(cards.revenue_this_month)} />
                <Card label="Total Pendapatan" value={rupiah(cards.revenue_total)} />
                <Card label="Pesanan Pending" value={cards.orders_pending} />
                <Card label="Stok Tersedia" value={cards.books_available} />
            </div>

            <div className="rounded border p-4">
                <h2 className="mb-3 font-semibold">Pendapatan 12 Bulan Terakhir</h2>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={salesChart}>
                        <XAxis dataKey="month" />
                        <YAxis width={90} tickFormatter={rupiah} />
                        <Tooltip formatter={rupiah} />
                        <Bar dataKey="revenue" fill="#4f46e5" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Panel title="Buku Terlaris">
                    {topBooks.map((b) => (
                        <Row key={b.title} left={b.title} right={`${b.sold_qty} terjual`} />
                    ))}
                </Panel>
                <Panel title="Stok Menipis">
                    {lowStock.map((b) => (
                        <Row key={b.id} left={b.title} right={`sisa ${b.stock}`} />
                    ))}
                </Panel>
            </div>
        </div>
    )
}

function Card({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded border p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="rounded border p-4">
            <h2 className="mb-3 font-semibold">{title}</h2>
            <div className="space-y-2">{children}</div>
        </div>
    )
}

function Row({ left, right }: { left: string; right: string }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="truncate">{left}</span>
            <span className="text-gray-500">{right}</span>
        </div>
    )
}
