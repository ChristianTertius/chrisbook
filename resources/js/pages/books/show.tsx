import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { store as cartStore } from '@/actions/App/Http/Controllers/CartController';
import { login } from '@/routes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import PublicNavbar from '@/components/public-navbar';
import PublicFooter from '@/components/public-footer';
import SessionFlashWatcher from '@/components/session-flash-watcher';
export interface BookImage {
  id: number;
  path: string; // path file (storage), mis. 'books/abc.jpg'
  url: string; // accessor full URL kalau ada
  is_cover?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Book {
  id: number;
  title: string;
  author?: string | null;
  slug: string;
  description?: string | null;
  price: number;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  status: 'available' | 'sold';
  stock: number;
  cover_image?: string | null;
  category?: Category | null;
  images: BookImage[];
}
const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);

const conditionLabel: Record<Book['condition'], string> = {
  new: 'Baru',
  like_new: 'Seperti Baru',
  good: 'Bagus',
  fair: 'Cukup',
};

export default function Show({
  book,
  related,
}: {
  book: Book;
  related: Book[];
}) {
  const { auth } = usePage().props;
  const isSold = book.status === 'sold';

  // galeri: pakai images kalau ada, fallback ke cover_image
  const gallery = book.images?.length
    ? book.images.map((img) => img.url ?? `/storage/${img.path}`)
    : book.cover_image
      ? [`/storage/${book.cover_image}`]
      : ['/images/book-placeholder.png'];
  const [active, setActive] = useState(0);

  function beli() {
    if (isSold) return;
    if (!auth.user) {
      router.visit(login().url); // guest -> login dulu
      return;
    }
    router.post(
      cartStore().url,
      { book_id: book.id },
      {
        preserveScroll: true,
        onError: () => toast.error('Gagal menambahkan ke keranjang'),
      },
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Head title={book.title} />

      <PublicNavbar />
      <SessionFlashWatcher />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Kembali ke katalog
          </Link>

          <div className="mt-4 grid gap-8 md:grid-cols-2">
            {/* Galeri foto */}
            <div>
              <div className="aspect-[3/4] w-full overflow-hidden rounded-xl border bg-muted">
                <img
                  src={gallery[active]}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              </div>
              {gallery.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {gallery.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`h-16 w-16 overflow-hidden rounded-md border ${i === active ? 'ring-2 ring-primary' : ''}`}
                    >
                      <img
                        src={src}
                        alt={`${book.title} ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info buku */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-semibold">{book.title}</h1>
                {isSold ? (
                  <Badge variant="destructive">Terjual</Badge>
                ) : (
                  <Badge>Tersedia</Badge>
                )}
              </div>

              {book.author && (
                <p className="text-muted-foreground">oleh {book.author}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {conditionLabel[book.condition]}
                </Badge>
                {book.category && (
                  <Badge variant="outline">{book.category.name}</Badge>
                )}
              </div>

              <p className="text-3xl font-bold text-primary">
                {rupiah(book.price)}
              </p>

              {book.description && (
                <div>
                  <h2 className="mb-1 text-sm font-medium">Deskripsi</h2>
                  <p className="text-sm whitespace-pre-line text-muted-foreground">
                    {book.description}
                  </p>
                </div>
              )}

              <div className="mt-2">
                <Button
                  size="lg"
                  className="w-full md:w-auto"
                  disabled={isSold}
                  onClick={beli}
                >
                  {isSold ? 'Stok Habis' : 'Beli Sekarang'}
                </Button>
                {!auth.user && !isSold && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Perlu login dulu untuk membeli.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buku terkait */}
          {related?.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 text-lg font-semibold">
                Buku lain yang serupa
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {related.map((b) => (
                  <Link
                    key={b.id}
                    href={`/books/${b.slug}`}
                    className="group rounded-lg border p-2 transition hover:shadow-md"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
                      <img
                        src={
                          b.cover_image
                            ? `/storage/${b.cover_image}`
                            : '/images/book-placeholder.png'
                        }
                        alt={b.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm font-medium">
                      {b.title}
                    </p>
                    <p className="text-sm text-primary">{rupiah(b.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
