import { useState, type FormEvent } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import InputError from '@/components/input-error'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    store as bookStore,
    update as bookUpdate,
    destroy as bookDestroy,
} from '@/actions/App/Http/Controllers/Admin/BookController'

type Category = { id: number; name: string }
type BookImage = { id: number; path: string }
type Condition = 'new' | 'like_new' | 'good' | 'fair'
type Status = 'available' | 'sold'
type Book = {
    id: number
    title: string
    author: string | null
    isbn: string | null
    description: string | null
    category_id: number | null
    category: Category | null
    condition: Condition
    price: number
    stock: number
    status: Status
    cover_image: string | null
    images?: BookImage[]
}
type Paginated<T> = {
    data: T[]
    links: { url: string | null; label: string; active: boolean }[]
    total: number
}
type PageProps = {
    books: Paginated<Book>
    categories: Category[]
    filters: { search?: string }
}


const conditionLabel: Record<Condition, string> = {
    new: 'Baru', like_new: 'Seperti Baru', good: 'Baik', fair: 'Cukup',
}
const rupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID')

type BookFormData = {
    title: string
    category_id: string
    author: string
    isbn: string
    description: string
    condition: Condition
    price: number
    stock: number
    status: Status
    cover: File | null
    images: File[]
    deleted_images: number[]
}
const emptyForm: BookFormData = {
    title: '', category_id: '', author: '', isbn: '', description: '',
    condition: 'good', price: 0, stock: 1, status: 'available',
    cover: null, images: [], deleted_images: [],
}

export default function Index({ books, categories, filters }: PageProps) {
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Book | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)
    const [search, setSearch] = useState(filters.search ?? '')
    const form = useForm<BookFormData>({ ...emptyForm })

    function openCreate() {
        setEditing(null)
        form.setData({ ...emptyForm })
        form.clearErrors()
        setOpen(true)
    }

    function openEdit(book: Book) {
        setEditing(book)
        form.setData({
            title: book.title,
            category_id: book.category_id ? String(book.category_id) : '',
            author: book.author ?? '',
            isbn: book.isbn ?? '',
            description: book.description ?? '',
            condition: book.condition,
            price: book.price,
            stock: book.stock,
            status: book.status,
            cover: null, images: [], deleted_images: [],
        })
        form.clearErrors()
        setOpen(true)
    }

    function submit(e: FormEvent) {
        e.preventDefault()
        const options = {
            forceFormData: true, // WAJIB karena ada upload File
            preserveScroll: true,
            onSuccess: () => { setOpen(false); form.reset() },
        }
        if (editing) {
            // PUT + file = POST dengan method spoofing (_method)
            form.transform((d) => ({ ...d, _method: 'put' }))
            form.post(bookUpdate(editing.slug).url, options)
        } else {
            form.transform((d) => d)
            form.post(bookStore().url, options)
        }
    }

    function applySearch(e: FormEvent) {
        e.preventDefault()
        router.get('/admin/books', { search }, { preserveState: true, replace: true })
    }

    function confirmDelete() {
        if (!deleteTarget) return
        router.delete(bookDestroy(deleteTarget.slug).url, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        })
    }

    return (
        <div className='p-5'>
            <Head title="Kelola Buku" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Kelola Buku</h1>
                        <p className="text-sm text-muted-foreground">{books.total} buku terdaftar</p>
                    </div>
                    <Button onClick={openCreate}><Plus className="size-4" /> Tambah Buku</Button>
                </div>

                <form onSubmit={applySearch} className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari judul / penulis…" className="pl-9" />
                </form>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-14">Cover</TableHead>
                                <TableHead>Judul</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className="text-right">Harga</TableHead>
                                <TableHead className="text-center">Stok</TableHead>
                                <TableHead>Kondisi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-24 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {books.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                                        Belum ada buku. Klik “Tambah Buku” untuk mulai.
                                    </TableCell>
                                </TableRow>
                            )}
                            {books.data.map((book) => (
                                <TableRow key={book.id}>
                                    <TableCell>
                                        {book.cover_image
                                            ? <img src={`/storage/${book.cover_image}`} alt={book.title} className="size-10 rounded object-cover" />
                                            : <div className="size-10 rounded bg-muted" />}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{book.title}</div>
                                        {book.author && <div className="text-xs text-muted-foreground">{book.author}</div>}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{book.category?.name ?? '—'}</TableCell>
                                    <TableCell className="text-right tabular-nums">{rupiah(book.price)}</TableCell>
                                    <TableCell className="text-center tabular-nums">{book.stock}</TableCell>
                                    <TableCell><Badge variant="outline">{conditionLabel[book.condition]}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant={book.status === 'available' ? 'default' : 'secondary'}>
                                            {book.status === 'available' ? 'Tersedia' : 'Terjual'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => openEdit(book)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(book)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {books.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {books.links.map((link, i) => (
                            <Button key={i} size="sm" variant={link.active ? 'default' : 'outline'}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Create / Edit */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Buku' : 'Tambah Buku'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Perbarui detail buku.' : 'Isi detail buku baru.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                            <InputError message={form.errors.title} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="author">Penulis</Label>
                                <Input id="author" value={form.data.author} onChange={(e) => form.setData('author', e.target.value)} />
                                <InputError message={form.errors.author} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="isbn">ISBN</Label>
                                <Input id="isbn" value={form.data.isbn} onChange={(e) => form.setData('isbn', e.target.value)} />
                                <InputError message={form.errors.isbn} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Kategori</Label>
                            <Select value={form.data.category_id} onValueChange={(v) => form.setData('category_id', v)}>
                                <SelectTrigger id="category"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.category_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea id="description" rows={3} value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)} />
                            <InputError message={form.errors.description} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Harga (Rp)</Label>
                                <Input id="price" type="number" min={0} value={form.data.price}
                                    onChange={(e) => form.setData('price', Number(e.target.value))} />
                                <InputError message={form.errors.price} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stock">Stok</Label>
                                <Input id="stock" type="number" min={0} value={form.data.stock}
                                    onChange={(e) => form.setData('stock', Number(e.target.value))} />
                                <InputError message={form.errors.stock} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Kondisi</Label>
                                <Select value={form.data.condition}
                                    onValueChange={(v) => form.setData('condition', v as Condition)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">Baru</SelectItem>
                                        <SelectItem value="like_new">Seperti Baru</SelectItem>
                                        <SelectItem value="good">Baik</SelectItem>
                                        <SelectItem value="fair">Cukup</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={form.data.status} onValueChange={(v) => form.setData('status', v as Status)}>
                                <SelectTrigger className="sm:w-1/2"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Tersedia</SelectItem>
                                    <SelectItem value="sold">Terjual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="cover">Cover</Label>
                            {editing?.cover_image && (
                                <img src={`/storage/${editing.cover_image}`} alt="" className="size-20 rounded object-cover" />
                            )}
                            <Input id="cover" type="file" accept="image/*"
                                onChange={(e) => form.setData('cover', e.target.files?.[0] ?? null)} />
                            {form.progress && <progress value={form.progress.percentage} max="100" className="w-full" />}
                            <InputError message={form.errors.cover} />
                        </div>

                        {editing?.images && editing.images.length > 0 && (
                            <div className="grid gap-2">
                                <Label>Galeri saat ini</Label>
                                <div className="flex flex-wrap gap-2">
                                    {editing.images.map((img) => {
                                        const marked = form.data.deleted_images.includes(img.id)
                                        return (
                                            <button type="button" key={img.id}
                                                onClick={() => form.setData('deleted_images',
                                                    marked
                                                        ? form.data.deleted_images.filter((id) => id !== img.id)
                                                        : [...form.data.deleted_images, img.id])}
                                                className={`size-16 overflow-hidden rounded border ${marked ? 'opacity-40 ring-2 ring-destructive' : ''}`}>
                                                <img src={`/storage/${img.path}`} alt="" className="size-full object-cover" />
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">Klik gambar untuk menandai hapus.</p>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="images">Tambah foto galeri</Label>
                            <Input id="images" type="file" accept="image/*" multiple
                                onChange={(e) => form.setData('images', Array.from(e.target.files ?? []))} />
                            <InputError message={form.errors.images} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={form.processing}>
                                {editing ? 'Simpan Perubahan' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Konfirmasi Hapus */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus buku?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Buku “{deleteTarget?.title}” beserta foto-fotonya akan dihapus permanen dan tidak bisa dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

Index.layout = {
    breadcrumbs: [
        { title: 'Buku', href: '/admin/books' },
    ],
};
