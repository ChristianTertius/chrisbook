<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Order;
use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(Request $request, MidtransService $midtrans)
    {
        $data = $request->validate([
            'address' => ['required', 'array'],
            'shipping_cost' => ['required', 'integer', 'min:0'],
        ]);

        $user = Auth::user();

        $order = DB::transaction(function () use ($user, $data) {
            // ambil cart + item ; lock biar nggak ada perubahan barengan
            $cart = $user->cart()->with('items.book')->lockForUpdate()->firstOrFail();
            abort_if($cart->items->isEmpty(), 422, 'Keranjang Kosong!');

            // lock semua baris sekaligus, lalu validasi ketersediaan
            $books = Book::whereIn('id', $cart->items->pluck('book_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($cart->items as $item) {
                $book = $books[$item->book_id] ?? null;
                abort_if(
                    ! $book || $book->status !== Book::STATUS_AVAILABLE || $book->stock < 1,
                    409,
                    "Buku \"{$item->book?->title}\" sudah tidak tersedia."
                );
            }

            $subtotal = $cart->items->sum(fn($item) => $item->price * $item->qty);
            $total = $subtotal + $data['shipping_cost'];

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => 'INV-' . now()->format('Ymd') . '-' . strtoupper(uniqid()),
                'status' => Order::STATUS_PENDING,
                'subtotal' => $subtotal,
                'shipping_cost' => $data['shipping_cost'],
                'total' => $total,
                'shipping_address' => $data['address'],
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'book_id' => $item->book_id,
                    'title' => $item->book->title, // snapshot judul
                    'qty' => $item->qty,
                    'price' => $item->price,
                ]);

                // kunci buku biar nggak kebeli dua kali
                $books[$item->book_id]->update(['status' => Book::STATUS_SOLD]);
            }

            // kosongkan cart setelah jadi order
            $cart->items()->delete();

            return $order;
        });

        $order->load('items', 'user');
        $snapToken = $midtrans->createSnapToken($order);

        Payment::create([
            'order_id' => $order->id,
            'midtrans_order_id' => $order->order_number,
            'snap_token' => $snapToken,
            'gross_amount' => $order->total,
            'status' => Payment::STATUS_PENDING,
        ]);

        return back()->with('snap_token', $snapToken);
    }
}
