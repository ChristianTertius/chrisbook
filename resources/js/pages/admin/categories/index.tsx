import { useState, type FormEvent } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    store as categoryStore,
    update as categoryUpdate,
    destroy as categoryDestroy,
} from '@/actions/App/Http/Controllers/Admin/CategoryController'

type Category = {
    id: number
    name: string
    slug: string
    books_count: number
}
type PageProps = {
    categories: Category[]
    filters: { search?: string }
}

type CategoryFormData = { name: string }
const emptyForm: CategoryFormData = { name: '' }

export default function Index({ categories, filters }: PageProps) {
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Category | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
    const [search, setSearch] = useState(filters.search ?? '')
    const form = useForm<CategoryFormData>({ ...emptyForm })

    function openCreate() {
        setEditing(null)
        form.setData({ ...emptyForm })
        form.clearErrors()
        setOpen(true)
    }

    function openEdit(category: Category) {
        setEditing(category)
        form.setData({ name: category.name })
        form.clearErrors()
        setOpen(true)
    }

    function submit(e: FormEvent) {
        e.preventDefault()
        const options = {
            preserveScroll: true,
            onSuccess: () => { setOpen(false); form.reset() },
        }
        // Tanpa upload file -> cukup PUT/POST biasa (tidak perlu _method spoofing)
        if (editing) {
            form.put(categoryUpdate(editing.id).url, options)
        } else {
            form.post(categoryStore().url, options)
        }
    }

    function applySearch(e: FormEvent) {
        e.preventDefault()
        router.get('/admin/categories', { search }, { preserveState: true, replace: true })
    }

    function confirmDelete() {
        if (!deleteTarget) return
        router.delete(categoryDestroy(deleteTarget.id).url, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        })
    }

    return (
        <div className='p-5'>
            <Head title="Kelola Kategori" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Kelola Kategori</h1>
                        <p className="text-sm text-muted-foreground">{categories.length} kategori</p>
                    </div>
                    <Button onClick={openCreate}><Plus className="size-4" /> Tambah Kategori</Button>
                </div>

                <form onSubmit={applySearch} className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kategori…" className="pl-9" />
                </form>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-center">Jumlah Buku</TableHead>
                                <TableHead className="w-24 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                                        Belum ada kategori. Klik “Tambah Kategori” untuk mulai.
                                    </TableCell>
                                </TableRow>
                            )}
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{category.books_count}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => openEdit(category)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(category)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modal Create / Edit */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Perbarui nama kategori.' : 'Buat kategori baru untuk mengelompokkan buku.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Kategori</Label>
                            <Input id="name" autoFocus value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="mis. Novel, Self-Help, Komik" />
                            <InputError message={form.errors.name} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={form.processing}>
                                {editing ? 'Simpan' : 'Tambah'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog konfirmasi hapus */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Kategori “{deleteTarget?.name}” akan dihapus.{' '}
                            {deleteTarget && deleteTarget.books_count > 0
                                ? `${deleteTarget.books_count} buku terkait akan menjadi tanpa kategori (tidak ikut terhapus).`
                                : 'Tindakan ini tidak bisa dibatalkan.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={confirmDelete}>
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
        { title: 'Kategori Buku', href: '/admin/books' },
    ],
};
