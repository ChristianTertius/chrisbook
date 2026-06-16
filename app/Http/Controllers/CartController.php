<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cart = Auth::user()->cart()->with('items.book.images')->first();

        return Inertia::render('Cart', [
            'items' => $cart?->items ?? [],
            'subtotal' => $cart?->subtotal() ?? 0,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $data = $request->validate([
            'book_id' => ['required', 'exists:books,id'],
        ]);

        $book = Book::available()->findOrFail($data['book_id']);

        // ambil / buat cart milik user
        $cart = Auth::user()->cart()->firstOrCreate([]);

        // buku bekas stok = 1, jadi qty selalu 1 (unique cart_id+book_id mencegah dobel)
        $cart->items()->updateOrCreate([
            ['book_id' => $book->id],
            [
                'qty' => 1,
                'price' => $book->price,
            ],
        ]);

        return back()->with('success', 'Book added to cart successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $itemId)
    {
        $cart = Auth::user()->cart;
        $cart?->items()->where('id', $itemId)->delete();

        return back()->with('success', 'Book removed from cart successfully.');
    }
}
