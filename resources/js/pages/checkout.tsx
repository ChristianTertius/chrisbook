import { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { store as checkoutStore } from '@/actions/App/Http/Controllers/CheckoutController';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { CheckoutItem, ShippingOption } from '@/types/checkout';
import type { Address } from '@/types/address';
import PublicNavbar from '@/components/public-navbar';
import PublicFooter from '@/components/public-footer';
import SessionFlashWatcher from '@/components/session-flash-watcher';

const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);

declare global {
  interface Window {
    snap?: { pay: (token: string, opts?: Record<string, unknown>) => void };
  }
}

export default function Checkout({
  items,
  subtotal,
  addresses,
  shippingOptions = [],
}: {
  items: CheckoutItem[];
  subtotal: number;
  addresses: Address[];
  shippingOptions?: ShippingOption[];
}) {
  const { props } = usePage();
  const [addressId, setAddressId] = useState<string>(
    addresses[0]?.id?.toString() ?? '',
  );
  const [shipKey, setShipKey] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const selectedShipping = useMemo(
    () => shippingOptions.find((o) => `${o.courier}-${o.service}` === shipKey),
    [shipKey, shippingOptions],
  );
  const shippingCost = selectedShipping?.cost ?? 0;
  const total = subtotal + shippingCost;

  function bayar() {
    if (!addressId) return toast.error('Pilih alamat pengiriman dulu.');
    if (!selectedShipping) return toast.error('Pilih layanan pengiriman dulu.');

    setProcessing(true);
    router.post(
      checkoutStore().url,
      {
        address_id: Number(addressId),
        courier: selectedShipping.courier,
        shipping_service: selectedShipping.service,
        shipping_cost: selectedShipping.cost,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          const token = (props as any).flash?.snap_token;
          if (token && window.snap) {
            window.snap.pay(token, {
              onSuccess: () => router.visit('/orders'),
              onPending: () => router.visit('/orders'),
              onError: () => toast.error('Pembayaran gagal.'),
              onClose: () => toast('Kamu menutup popup sebelum membayar.'),
            });
          }
        },
        onError: () => toast.error('Checkout gagal. Coba lagi.'),
        onFinish: () => setProcessing(false),
      },
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Head title="Checkout" />
      <PublicNavbar />
      <SessionFlashWatcher />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold">Checkout</h1>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Alamat */}
              <section className="rounded-lg border p-4">
                <Label className="mb-2 block font-medium">
                  Alamat Pengiriman
                </Label>
                {addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada alamat. Tambah alamat dulu di menu Alamat.
                  </p>
                ) : (
                  <Select value={addressId} onValueChange={setAddressId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih alamat" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((a) => (
                        <SelectItem key={a.id} value={a.id.toString()}>
                          {a.recipient_name} — {a.full_address}, {a.city_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </section>

              {/* Pengiriman */}
              <section className="rounded-lg border p-4">
                <Label className="mb-2 block font-medium">
                  Layanan Pengiriman
                </Label>
                <Select value={shipKey} onValueChange={setShipKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kurir & layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingOptions.map((o) => (
                      <SelectItem
                        key={`${o.courier}-${o.service}`}
                        value={`${o.courier}-${o.service}`}
                      >
                        {o.courier.toUpperCase()} {o.service} — {rupiah(o.cost)}{' '}
                        {o.etd ? `(${o.etd})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              {/* Daftar buku */}
              <section className="rounded-lg border p-4">
                <Label className="mb-2 block font-medium">
                  Buku ({items.length})
                </Label>
                <div className="flex flex-col gap-3">
                  {items.map((b) => (
                    <div key={b.id} className="flex items-center gap-3">
                      <div className="h-14 w-11 shrink-0 overflow-hidden rounded bg-muted">
                        <img
                          src={
                            b.cover_image
                              ? `/storage/${b.cover_image}`
                              : '/images/book-placeholder.png'
                          }
                          alt={b.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="flex-1 text-sm">{b.title}</span>
                      <span className="text-sm font-medium">
                        {rupiah(b.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Ringkasan */}
            <div className="h-fit rounded-lg border p-4">
              <h2 className="font-semibold">Ringkasan Pembayaran</h2>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{rupiah(subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Ongkir</span>
                <span>{rupiah(shippingCost)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                <span>Total</span>
                <span className="text-primary">{rupiah(total)}</span>
              </div>
              <Button
                className="mt-4 w-full"
                size="lg"
                disabled={processing}
                onClick={bayar}
              >
                {processing ? 'Memproses...' : 'Bayar Sekarang'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
