<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Cart;
use App\Models\CartItem;
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

        $items = $cart
            ? $cart->items->map(fn(CartItem $item) => [
                'id' => $item->id,
                'book' => [
                    'id' => $item->book->id,
                    'title' => $item->book->title,
                    'slug' => $item->book->slug,
                    'price' => $item->book->price,
                    'status' => $item->book->status,
                    'cover_image' => $item->book->cover_image,
                ],
            ])
            : collect();

        return Inertia::render('cart', [
            'items' => $cart?->items ?? [],
            'total' => $cart?->subtotal() ?? 0,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'book_id' => ['required', 'exists:books,id'],
        ]);

        $book = Book::findOrFail($data['book_id']);

        // tolak kalau buku sudah terjual / tidak tersedia
        if ($book->status != 'available') {
            return back()->with('error', 'Buku ini sudah tidak tersedia');
        }

        $cart = Auth::user()->cart()->firstOrCreate([]);

        // cegah duplicate (qty selalu 1)
        $exits = $cart->items()->where('book_id', $book->id)->exists();
        if ($exits) {
            return back()->with('error', 'Buku sudah ada di keranjang');
        }
        $cart->items()->create(['book_id' => $book->id, 'price' => $book->price, 'qty' => 1]);

        return back()->with('success', 'Buku berhasil di tambahkan dikeranjang');
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
    public function destroy(CartItem $item)
    {
        abort_unless($item->cart->user_id == Auth::id(), 403);
        $item->delete();

        return back()->with('success', 'Buku dihapus dari keranjang');
    }
}
