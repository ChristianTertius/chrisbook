<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $books = Book::query()
            ->available()
            ->with('category')
            ->when($request->search, fn($q, $s) => $q->where(fn($q) => $q->where('title', 'like', "%{$s}%")->orWhere('author', 'like', "%{$s}%")))
            ->when($request->category, fn($q, $c) => $q->whereHas('category', fn($q) => $q->where('slug', $c)))
            ->when($request->condition, fn($q, $c) => $q->where('condition', $c))
            ->when($request->min_price, fn($q, $p) => $q->where('price', '>=', $p))
            ->when($request->max_price, fn($q, $p) => $q->where('price', '<=', $p))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Home', [
            'books' => $books,
            'categories' => Category::orderBy('name')->get(),
            'filters' => $request->only(['search', 'category', 'condition', 'min_price', 'max_price']),
        ]);
    }

    public function show(Book $book)
    {
        $book->load(['images', 'category']);

        $related = Book::query()
            ->where('status', 'available')
            ->where('id', '!=', $book->id)
            ->when($book->category_id, fn($q) =>
            $q->where('category_id', $book->category_id))
            ->latest()
            ->take(4)
            ->get();

        return Inertia::render('books/show', [
            'book' => $book,
            'related' => $related
        ]);
    }
}
