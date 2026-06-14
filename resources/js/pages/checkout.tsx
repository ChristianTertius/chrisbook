// resources/js/Pages/Checkout.tsx (tambahan alamat + ongkir, cuplikan)
import type { FormEvent } from 'react'
import { useState } from 'react'
import { router, useForm } from '@inertiajs/react'
import { store as checkoutStore } from '@/actions/App/Http/Controllers/CheckoutController'

type CartItem = { id: number; title: string; price: number; qty: number }
type Address = { id: number; recipient: string; city: string; city_id: string; full_address: string; is_default: boolean }
type ShippingOption = { name: string; code: string; service: string; cost: number; etd: string }

type CheckoutProps = {
    items: CartItem[]
    subtotal: number
    addresses: Address[]
    // ongkir dihitung di server (CheckoutController@create) lalu dikirim sebagai prop
    shippingOptions: ShippingOption[]
}

export default function Checkout({ items, subtotal, addresses, shippingOptions }: CheckoutProps) {
    const def = addresses.find(a => a.is_default) ?? addresses[0]
    const { data, setData, post, processing } = useForm({
        address_id: def?.id ?? 0,
        courier: '',
        shipping_cost: 0,
    })
    const [loadingCost, setLoadingCost] = useState(false)

    const total = subtotal + data.shipping_cost

    // Inertia partial reload: minta ulang HANYA prop "shippingOptions" dari server.
    // Tetap dalam paradigma monolith — nggak ada JSON API / axios terpisah.
    function fetchCost(courier: string) {
        setData('courier', courier)
        setData('shipping_cost', 0)
        router.reload({
            only: ['shippingOptions'],
            data: { address_id: data.address_id, courier },
            onStart: () => setLoadingCost(true),
            onFinish: () => setLoadingCost(false),
        })
    }

    function submit(e: FormEvent) {
        e.preventDefault()
        // handler Snap (onSuccess) sama seperti Section 19d
        post(checkoutStore().url, { preserveScroll: true })
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <h1 className="text-xl font-bold">Checkout ({items.length} buku)</h1>

            <select value={data.address_id} onChange={e => setData('address_id', Number(e.target.value))}
                className="w-full rounded border px-3 py-2">
                {addresses.map(a => (
                    <option key={a.id} value={a.id}>
                        {a.recipient} — {a.city} {a.is_default ? '(default)' : ''}
                    </option>
                ))}
            </select>

            <select value={data.courier} onChange={e => fetchCost(e.target.value)}
                className="w-full rounded border px-3 py-2">
                <option value="">Pilih kurir</option>
                <option value="jne">JNE</option>
                <option value="jnt">J&T</option>
                <option value="sicepat">SiCepat</option>
            </select>

            {loadingCost && <p className="text-sm text-gray-500">Menghitung ongkir…</p>}
            <ul className="space-y-1">
                {shippingOptions.map(o => (
                    <li key={o.service}>
                        <label className="flex gap-2 text-sm">
                            <input type="radio" name="service"
                                checked={data.shipping_cost === o.cost}
                                onChange={() => setData('shipping_cost', o.cost)} />
                            {o.service} — Rp{o.cost.toLocaleString('id-ID')} ({o.etd} hari)
                        </label>
                    </li>
                ))}
            </ul>

            <div className="space-y-1 text-sm">
                <p>Subtotal: Rp{subtotal.toLocaleString('id-ID')}</p>
                <p>Ongkir: Rp{data.shipping_cost.toLocaleString('id-ID')}</p>
                <p className="font-bold">Total: Rp{total.toLocaleString('id-ID')}</p>
            </div>

            <button type="submit" disabled={processing || !data.shipping_cost}
                className="rounded bg-indigo-600 px-4 py-2 text-white">
                Bayar Sekarang
            </button>
        </form>
    )
}
