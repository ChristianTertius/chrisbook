import { useForm, router } from '@inertiajs/react'
import { store as checkoutStore } from '@/actions/App/Http/Controllers/CheckoutController'
import { index as ordersIndex } from '@/actions/App/Http/Controllers/OrderController'

type CartItem = { id: number; title: string; price: number; qty: number }

type CheckoutProps = {
    items: CartItem[]
    subtotal: number
    address?: Record<string, string>
}

export default function Checkout({ items, subtotal, address }: CheckoutProps) {
    const { data, setData, post, processing } = useForm({
        address: address ?? {},
        shipping_cost: 0,
    })

    const total = subtotal + data.shipping_cost

    function submit(e: React.SubmitEvent) {
        e.preventDefault()
        post(checkoutStore().url, {
            preserveScroll: true,
            onSuccess: (page) => {
                const token = (page.props.flash as { snap_token?: string })?.snap_token
                if (token) window.snap.pay(token, {
                    onSuccess: () => router.visit(ordersIndex().url),
                    onPending: () => router.visit(ordersIndex().url),
                    onError: () => alert('Pembayaran gagal, coba lagi.'),
                    onClose: () => alert('Kamu menutup popup sebelum menyelesaikan pembayaran.'),
                })
            },
        })
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <h1 className="text-xl font-bold">Checkout ({items.length} buku)</h1>

            <ul className="divide-y rounded border">
                {items.map((item) => (
                    <li key={item.id} className="flex justify-between p-3 text-sm">
                        <span className="truncate">{item.title}</span>
                        <span>Rp{item.price.toLocaleString('id-ID')}</span>
                    </li>
                ))}
            </ul>

            {/* form alamat & ongkir di sini */}
            <div className="space-y-1 text-sm">
                <p>Subtotal: Rp{subtotal.toLocaleString('id-ID')}</p>
                <p>Ongkir: Rp{data.shipping_cost.toLocaleString('id-ID')}</p>
                <p className="font-bold">Total: Rp{total.toLocaleString('id-ID')}</p>
            </div>

            <button type="submit" disabled={processing} className="rounded bg-indigo-600 px-4 py-2 text-white">
                Bayar Sekarang
            </button>
        </form>
    )
}
