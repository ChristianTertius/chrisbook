import { useForm, router } from '@inertiajs/react'
// Wayfinder: fungsi type-safe hasil generate dari controller (no magic string)
import { store as checkoutStore } from '@/actions/App/Http/Controllers/CheckoutController'
import { index as ordersIndex } from '@/actions/App/Http/Controllers/OrderController'

interface Book {
    id: number
    title: string
    price: number
}

interface Address {
    [key: string]: string
}

interface Props {
    book: Book
    address?: Address
}

export default function Checkout({ book, address }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        book_id: book.id,
        address: address ?? {},
        shipping_cost: 0,
    })

    function submit({ e }: any) {
        e.preventDefault()
        // checkoutStore() -> { url: '/checkout', method: 'post' }
        post(checkoutStore().url, {
            preserveScroll: true,
            onSuccess: (page) => {
                const token = page.props.flash?.snap_token
                if (token) payWithSnap(token)
            },
        })
    }

    function payWithSnap(token: string) {
        // window.snap dari script snap.js di layout
        window.snap.pay(token, {
            onSuccess: () => router.visit(ordersIndex().url),
            onPending: () => router.visit(ordersIndex().url),
            onError: () => alert('Pembayaran gagal, coba lagi.'),
            onClose: () => alert('Kamu menutup popup sebelum menyelesaikan pembayaran.'),
        })
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <h1 className="text-xl font-bold">Checkout: {book.title}</h1>
            <p>Harga: Rp{book.price.toLocaleString('id-ID')}</p>
            {/* form alamat & ongkir di sini */}
            <button
                type="submit"
                disabled={processing}
                className="rounded bg-indigo-600 px-4 py-2 text-white">
                Bayar Sekarang
            </button>
        </form>
    )
}
