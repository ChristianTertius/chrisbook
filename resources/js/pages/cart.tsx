import { Head, Link, router } from '@inertiajs/react';
import { destroy as cartDestroy } from '@/actions/App/Http/Controllers/CartController';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import type { CartItem } from '@/types/cart';
import PublicNavbar from '@/components/public-navbar';
import PublicFooter from '@/components/public-footer';

const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);

export default function Cart({
  items,
  total,
}: {
  items: CartItem[];
  total: number;
}) {
  function hapus(item: CartItem) {
    router.delete(cartDestroy({ item: item.id }).url, {
      preserveScroll: true,
      onSuccess: () => toast.success('Buku dihapus dari keranjang'),
      onError: () => toast.error('Gagal menghapus buku'),
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Head title="Keranjang" />
        <PublicNavbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold">Keranjang</h1>
            <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
              <p className="text-muted-foreground">Keranjangmu masih kosong.</p>
              <Button asChild>
                <Link href="/">Cari buku</Link>
              </Button>
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Head title="Keranjang" />
      <PublicNavbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold">Keranjang</h1>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Daftar item */}
            <div className="flex flex-col gap-3 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    <img
                      src={
                        item.book.cover_image
                          ? `/storage/${item.book.cover_image}`
                          : '/images/book-placeholder.png'
                      }
                      alt={item.book.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/books/${item.book.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.book.title}
                    </Link>
                    <div className="mt-1">
                      {item.book.status === 'available' ? (
                        <Badge variant="secondary">Tersedia</Badge>
                      ) : (
                        <Badge variant="destructive">Terjual</Badge>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-primary">
                    {rupiah(item.book.price)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => hapus(item)}
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Ringkasan */}
            <div className="h-fit rounded-lg border p-4">
              <h2 className="font-semibold">Ringkasan</h2>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Jumlah buku</span>
                <span>{items.length}</span>
              </div>
              <div className="mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{rupiah(total)}</span>
              </div>
              <Button asChild className="mt-4 w-full" size="lg">
                <Link href="/checkout">Lanjut ke Checkout</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
