import { Head, Link, usePage, router } from '@inertiajs/react';
import { BookOpen, LogOut, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { login, logout, register } from '@/routes';

type Book = {
    id: number;
    title: string;
    slug: string;
    author: string;
    price: number;
    cover_image: string | null;
    condition: string;
    stock: number;
    category: { id: number; name: string; slug: string } | null;
};

type Category = {
    id: number;
    name: string;
    slug: string;
};

type PaginatedBooks = {
    data: Book[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    books: PaginatedBooks;
    categories: Category[];
    filters: {
        search?: string;
        category?: string;
        condition?: string;
        min_price?: string;
        max_price?: string;
    };
};

const conditionLabels: Record<string, string> = {
    new: 'Baru',
    like_new: 'Seperti Baru',
    good: 'Baik',
    fair: 'Cukup',
};

const rupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');

export default function Home({ books, categories, filters }: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="ChrisBook - Toko Buku Online" />

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
                                    <button
                                        type="button"
                                        onClick={() => router.post(logout.url())}
                                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
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
                    {/* Hero */}
                    <section className="border-b bg-muted/30">
                        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                            <div className="mx-auto max-w-2xl text-center">
                                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                                    Temukan Buku Bekas
                                    <span className="text-primary"> Berkualitas</span>
                                </h1>
                                <p className="mt-4 text-lg text-muted-foreground">
                                    Beli dan jual buku bekas dengan harga terbaik. Kami
                                    menyediakan berbagai genre buku untuk kamu.
                                </p>

                                {/* Search */}
                                <form method="get" action="/" className="mt-8">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                name="search"
                                                placeholder="Cari buku atau penulis..."
                                                defaultValue={filters.search}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Button type="submit">Cari</Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>

                    {/* Category Filter */}
                    <section className="border-b">
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Kategori:
                                </span>
                                <Link
                                    href="/"
                                    className={`inline-block rounded-full px-4 py-1.5 text-sm transition-colors ${!filters.category
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted hover:bg-muted/80'
                                        }`}
                                >
                                    Semua
                                </Link>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/?category=${cat.slug}`}
                                        className={`inline-block rounded-full px-4 py-1.5 text-sm transition-colors ${filters.category === cat.slug
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted hover:bg-muted/80'
                                            }`}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Books Grid */}
                    <section className="py-8">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    {filters.search || filters.category
                                        ? 'Hasil Pencarian'
                                        : 'Buku Tersedia'}
                                </h2>
                                <span className="text-sm text-muted-foreground">
                                    {books.total} buku ditemukan
                                </span>
                            </div>

                            {books.data.length === 0 ? (
                                <div className="py-16 text-center">
                                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                    <h3 className="mt-4 text-lg font-medium">
                                        Buku tidak ditemukan
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Coba gunakan kata kunci lain atau filter berbeda.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {books.data.map((book) => (
                                        <Link
                                            key={book.id}
                                            href={`/books/${book.slug}`}
                                            className="group rounded-lg border bg-card transition-shadow hover:shadow-lg"
                                        >
                                            <div className="aspect-[3/4] overflow-hidden rounded-t-lg bg-muted">
                                                {book.cover_image ? (
                                                    <img
                                                        src={`storage/${book.cover_image}`}
                                                        alt={book.title}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                {book.category && (
                                                    <Badge variant="secondary" className="mb-2">
                                                        {book.category.name}
                                                    </Badge>
                                                )}
                                                <h3 className="leading-tight font-semibold group-hover:text-primary">
                                                    {book.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {book.author}
                                                </p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-lg font-bold text-primary">
                                                        {rupiah(book.price)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {conditionLabels[book.condition] || book.condition}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {books.last_page > 1 && (
                                <div className="mt-8 flex justify-center gap-1">
                                    {books.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors ${link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                                } ${!link.url ? 'pointer-events-none text-muted-foreground/50' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t bg-muted/50">
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
