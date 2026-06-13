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
            'book_id' => ['required', 'exists:books, id'],
            'address' => ['required', 'array'],
            'shipping_cost' => ['required', 'integer', 'min:0'],
        ]);

        $order = DB::transaction(function () use ($data) {
            // lock baris buku biar nggak kebeli barengnan(race condition)
            $book = Book::where('id',  $data['book_id'])
                ->lockForUpdate()
                ->firstOrFail();

            abort_if($book->status !== Book::STATUS_AVAILABLE || $book->stock < 1, 409, 'Buku sudah tidak tersedia!');

            $subtotal = $book->price;
            $total = $subtotal + $data['shipping_cost'];

            $order = Order::create([
                'user_id' => Auth::id(),
                'order_number' => 'INV-' . now()->format('Ymd') . '-' . strtoupper(uniqid()),
                'status' => Order::STATUS_PENDING,
                'subtotal' => $subtotal,
                'shipping_cost' => $data['shipping_cost'],
                'total' => $total,
                'shipping_address' => $data['address'],
            ]);

            $order->items()->create([
                'book_id' => $book->id,
                'title' => $book->title,
                'qty' => 1,
                'price' => $book->price,
            ]);

            // tandai buku sedang di proses (hindari double buy saat pending)
            $book->update(['status' => Book::STATUS_SOLD]);
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
