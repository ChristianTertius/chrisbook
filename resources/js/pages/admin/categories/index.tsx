import type { FormEvent } from 'react'
import { useForm } from '@inertiajs/react'
import { store as categoryStore, update as categoryUpdate, destroy as categoryDestroy }
    from '@/actions/App/Http/Controllers/Admin/CategoryController'

type Category = { id: number; name: string; slug: string; books_count: number }

type IndexProps = { categories: Category[] }

export default function Index({ categories }: IndexProps) {
    // satu form dipakai buat create & edit; kalau editingId null berarti mode create
    const { data, setData, post, put, delete: destroy, processing, errors, reset } =
        useForm<{ id: number | null; name: string }>({ id: null, name: '' })

    function submit(e: FormEvent) {
        e.preventDefault()
        if (data.id) {
            put(categoryUpdate(data.id).url, { preserveScroll: true, onSuccess: () => reset() })
        } else {
            post(categoryStore().url, { preserveScroll: true, onSuccess: () => reset() })
        }
    }

    function remove(category: Category) {
        if (confirm(`Hapus kategori "${category.name}"?`)) {
            destroy(categoryDestroy(category.id).url, { preserveScroll: true })
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={submit} className="flex items-end gap-2">
                <div className="flex-1">
                    <label className="text-sm text-gray-500">
                        {data.id ? 'Edit kategori' : 'Kategori baru'}
                    </label>
                    <input
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        placeholder="Nama kategori"
                        className="w-full rounded border px-3 py-2" />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>
                <button type="submit" disabled={processing} className="rounded bg-indigo-600 px-4 py-2 text-white">
                    {data.id ? 'Simpan' : 'Tambah'}
                </button>
                {data.id && (
                    <button type="button" onClick={() => reset()} className="rounded border px-4 py-2">
                        Batal
                    </button>
                )}
            </form>

            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b text-left text-gray-500">
                        <th className="py-2">Nama</th>
                        <th>Slug</th>
                        <th>Jumlah Buku</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((c) => (
                        <tr key={c.id} className="border-b">
                            <td className="py-2">{c.name}</td>
                            <td className="text-gray-500">{c.slug}</td>
                            <td>{c.books_count}</td>
                            <td className="flex gap-3 py-2">
                                <button onClick={() => setData({ id: c.id, name: c.name })} className="text-indigo-600">
                                    Edit
                                </button>
                                <button onClick={() => remove(c)} className="text-red-600">
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
