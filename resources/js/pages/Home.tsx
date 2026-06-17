import { Head, Link } from '@inertiajs/react';
import { BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PublicNavbar from '@/components/public-navbar';
import PublicFooter from '@/components/public-footer';

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
    return (
        <>
            <Head title="ChrisBook - Toko Buku Online" />

            <div className="flex min-h-screen flex-col bg-background">
                <PublicNavbar />

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
                                                        src={`/storage/${book.cover_image}`}
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
                                            className={`inline-flex min-w-9 h-9 items-center justify-center rounded-md px-2 text-sm transition-colors ${link.active
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

                <PublicFooter />
            </div>
        </>
    );
}
