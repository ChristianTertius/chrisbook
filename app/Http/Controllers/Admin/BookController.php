<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookRequest;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Inertia::render('admin/books/index', [
            'books' => Book::with(['category', 'images'])
                ->when($request->search, fn ($q, $s) => $q->where(fn ($q) => $q->where('title', 'like', "%{$s}%")
                    ->orWhere('author', 'like', "%{$s}%")))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Books/Create', [
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BookRequest $request)
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $data) {
            $data['slug'] = $this->uniqueSlug($data['title']);

            if ($request->hasFile('cover')) {
                $data['cover_image'] = $request->file('cover')->store('books/covers', 'public');
            }

            $book = Book::create($data);

            $this->syncGallery($book, $request->file('images', []));
        });

        return redirect()->route('admin.books.index')->with('success', 'Book created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book) {}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Book $book)
    {
        return Inertia::render('Admin/Books/Edit', [
            'book' => $book->load('images'),
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(BookRequest $request, Book $book)
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $data, $book) {
            // regenrate slug hanya kalo judulnya berubah
            if ($data['title'] != $book->title) {
                $data['slug'] = $this->uniqueSlug($data['title'], $book->id);
            }

            if ($request->hasFile('cover')) {
                if ($book->cover_image) {
                    Storage::disk('public')->delete($book->cover_image);
                }

                $data['cover_image'] = $request->file('cover')->store('books/covers', 'public');
            }
            $book->update($data);

            // hapus gambar gallery yg ditandai
            if ($ids = $request->input('deleted_images')) {
                $images = $book->images()->whereIn('id', $ids)->get();
                foreach ($images as $image) {
                    Storage::disk('public')->delete($image->path);
                    $image->delete();
                }
            }

            $this->syncGallery($book, $request->file('images', []));
        });

        return redirect()->route('admin.books.index')->with('success', 'Book updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book)
    {
        DB::transaction(function () use ($book) {
            if ($book->cover_image) {
                Storage::disk('public')->delete($book->cover_image);
            }

            foreach ($book->images as $image) {
                Storage::disk('public')->delete($image->path);
            }

            $book->delete(); // book images ikut terhapus krn cascade on delete
        });

        return back()->with('success', 'Buku berhasil dihapus');
    }

    // simpan beberapa file galeri ke book_images
    public function syncGallery(Book $book, array $files): void
    {
        $start = (int) $book->images()->max('sort_order');

        foreach ($files as $i => $file) {
            $book->images()->create([
                'path' => $file->store('books/gallery', 'public'),
                'sort_order' => $start + $i + 1,
            ]);
        }
    }

    public function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug);
        $slug = $base;
        $n = 1;

        while (Book::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$n++;
        }

        return $slug;
    }
}
