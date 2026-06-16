import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, ChevronLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { login, register } from '@/routes';

type BookImage = {
  id: number;
  path: string;
  sort_order: number;
};

type BookDetail = {
  id: number;
  title: string;
  slug: string;
  author: string;
  isbn: string;
  description: string;
  price: number;
  stock: number;
  condition: string;
  cover_image: string | null;
  status: string;
  category: { id: number; name: string; slug: string } | null;
  images: BookImage[];
};

type Props = {
  book: BookDetail;
  related: BookDetail[];
};

const conditionLabels: Record<string, string> = {
  new: 'Baru',
  like_new: 'Seperti Baru',
  good: 'Baik',
  fair: 'Cukup',
};

const rupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

export default function Book({ book, related }: Props) {
  const { auth } = usePage().props;

  return (
    <>
      <Head title={`${book.title} - ChrisBook`} />

      <div className="flex min-h-screen flex-col bg-background">
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold"
            >
              <BookOpen className="h-6 w-6 text-primary" />
              ChrisBook
            </Link>

            <nav className="flex items-center gap-4">
              {auth.user ? (
                <>
                  <Link href="/cart" className="relative">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  </Link>
                  <Link
                    href={auth.user.role === 'admin' ? '/admin/dashboard' : '/'}
                  >
                    <Button variant="outline" size="sm">
                      {auth.user.role === 'admin' ? 'Dashboard' : 'My Orders'}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={login()}>
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href={register()}>
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Back link */}
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali ke katalog
            </Link>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Cover Image */}
              <div className="overflow-hidden rounded-lg bg-muted">
                {book.cover_image ? (
                  <img
                    src={book.cover_image}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center">
                    <BookOpen className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div>
                {book.category && (
                  <Badge variant="secondary" className="mb-3">
                    {book.category.name}
                  </Badge>
                )}

                <h1 className="text-3xl font-bold">{book.title}</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                  oleh {book.author || 'Unknown'}
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {rupiah(book.price)}
                  </span>
                  {book.stock > 0 ? (
                    <Badge variant="outline" className="text-green-600">
                      Stok: {book.stock}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Habis</Badge>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {conditionLabels[book.condition] || book.condition}
                  </Badge>
                  {book.isbn && (
                    <Badge variant="outline">ISBN: {book.isbn}</Badge>
                  )}
                </div>

                {book.description && (
                  <div className="mt-6">
                    <h2 className="font-semibold">Deskripsi</h2>
                    <p className="mt-2 whitespace-pre-line text-muted-foreground">
                      {book.description}
                    </p>
                  </div>
                )}

                <div className="mt-8">
                  {auth.user ? (
                    <form method="post" action="/cart" className="flex gap-3">
                      <input type="hidden" name="book_id" value={book.id} />
                      <Button
                        type="submit"
                        size="lg"
                        className="flex-1"
                        disabled={book.stock === 0}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {book.stock === 0
                          ? 'Stok Habis'
                          : 'Tambah ke Keranjang'}
                      </Button>
                    </form>
                  ) : (
                    <div className="rounded-lg border bg-muted/30 p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Silakan login untuk membeli buku ini
                      </p>
                      <div className="mt-3 flex justify-center gap-3">
                        <Link href={login()}>
                          <Button variant="outline">Log in</Button>
                        </Link>
                        <Link href={register()}>
                          <Button>Register</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Books */}
            {related.length > 0 && (
              <section className="mt-16">
                <h2 className="mb-6 text-2xl font-bold">Buku Terkait</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {related.map((b) => (
                    <Link
                      key={b.id}
                      href={`/books/${b.slug}`}
                      className="group rounded-lg border bg-card transition-shadow hover:shadow-lg"
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-t-lg bg-muted">
                        {b.cover_image ? (
                          <img
                            src={b.cover_image}
                            alt={b.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm leading-tight font-semibold group-hover:text-primary">
                          {b.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {rupiah(b.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                ChrisBook
              </div>
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} ChrisBook. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
