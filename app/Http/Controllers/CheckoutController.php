<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Order;
use App\Models\Payment;
use App\Services\MidtransService;
use App\Services\ShippingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function create(Request $request, ShippingService $shipping)
    {
        // $user = $request->user();
        // $cart = $user->cart()->with('items.book')->first();
        //
        // if (! $cart || $cart->items->isEmpty()) {
        //     return redirect('/cart')->with('error', 'Keranjang Kosong');
        // }
        //
        // // ongkir dihitung hanya kalau frontend mengirim address_id + courier lewat
        // // router.reload partial. Saat halama pertama dibuka, options masih kosong
        // $shippingOptions = [];
        //
        // if ($request->filled('address_id') && $request->filled('courier')) {
        //     $address = $user->addresses()->find($request->address_id);
        //     if ($address?->city_id) {
        //         $weight = $cart->items->count() * ShippingService::DEFAULT_WEIGHT_PER_ITEM;
        //         $shippingOptions = $shipping->cost($address->city_id, $weight, $request->courier);
        //     }
        // }
        //
        // return Inertia::render('Checkout', [
        //     'items' => $cart->items->map(fn ($item) => [
        //         'id' => $item->id,
        //         'title' => $item->book->title,
        //         'price' => $item->price,
        //         'qty' => $item->qty,
        //     ]),
        //     'subtotal' => $cart->subtotal(),
        //     'addresses' => $user->addresses()->orderByDesc('is_default')->latest()->get(),
        //     'shippingOptions' => $shippingOptions,
        // ]);
        $cart = Auth::user()->cart()->with('items.book')->first();

        if (! $cart || $cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Keranjang masih kosong');
        }

        $items = $cart->items->map(fn ($item) => [
            'id' => $item->book->id,
            'title' => $item->book->title,
            'price' => $item->book->price,
            'cover_image' => $item->book->cover_image,
            'status' => $item->book->status,
        ]);

        return Inertia::render('checkout', [
            'items' => $items->values(),
            'subtotal' => $cart->total,
            'addresses' => Auth::user()->addresses()->get(),
            // berat total untuk estimasi ongkir
            'totalweight' => $cart->items->sum(fn ($i) => $i->book->weight ?? 500),
        ]);
    }

    // public function store(Request $request, MidtransService $midtrans)
    // {
    //     $data = $request->validate([
    //         'address_id' => ['required', Rule::exists('address', 'id')->where('user_id', Auth::id())],
    //         'courier' => ['required', 'string', 'max:50'],
    //         'shipping_cost' => ['required', 'integer', 'min:0'],
    //     ]);
    //
    //     $user = Auth::user();
    //
    //     $order = DB::transaction(function () use ($user, $data) {
    //         // ambil cart + item ; lock biar nggak ada perubahan barengan
    //         $cart = $user->cart()->with('items.book')->lockForUpdate()->firstOrFail();
    //         abort_if($cart->items->isEmpty(), 422, 'Keranjang Kosong!');
    //
    //         // lock semua baris sekaligus, lalu validasi ketersediaan
    //         $books = Book::whereIn('id', $cart->items->pluck('book_id'))
    //             ->lockForUpdate()
    //             ->get()
    //             ->keyBy('id');
    //
    //         foreach ($cart->items as $item) {
    //             $book = $books[$item->book_id] ?? null;
    //             abort_if(
    //                 ! $book || $book->status !== Book::STATUS_AVAILABLE || $book->stock < 1,
    //                 409,
    //                 "Buku \"{$item->book?->title}\" sudah tidak tersedia."
    //             );
    //         }
    //
    //         $subtotal = $cart->items->sum(fn($item) => $item->price * $item->qty);
    //         $total = $subtotal + $data['shipping_cost'];
    //         $address = $user->addresses()->findOrFail($data['address_id']);
    //
    //         $order = Order::create([
    //             'user_id' => $user->id,
    //             'order_number' => 'INV-' . now()->format('Ymd') . '-' . strtoupper(uniqid()),
    //             'status' => Order::STATUS_PENDING,
    //             'subtotal' => $subtotal,
    //             'courier' => $data['courier'],
    //             'shipping_cost' => $data['shipping_cost'],
    //             'total' => $subtotal + $data['shipping_cost'],
    //             'shipping_address' => $address->only([
    //                 'recipient',
    //                 'phone',
    //                 'province',
    //                 'city',
    //                 'postal_code',
    //                 'full_address',
    //             ]),
    //         ]);
    //
    //         foreach ($cart->items as $item) {
    //             $order->items()->create([
    //                 'book_id' => $item->book_id,
    //                 'title' => $item->book->title, // snapshot judul
    //                 'qty' => $item->qty,
    //                 'price' => $item->price,
    //             ]);
    //
    //             // kunci buku biar nggak kebeli dua kali
    //             $books[$item->book_id]->update(['status' => Book::STATUS_SOLD]);
    //         }
    //
    //         // kosongkan cart setelah jadi order
    //         $cart->items()->delete();
    //
    //         return $order;
    //     });
    //
    //     $order->load('items', 'user');
    //     $snapToken = $midtrans->createSnapToken($order);
    //
    //     Payment::create([
    //         'order_id' => $order->id,
    //         'midtrans_order_id' => $order->order_number,
    //         'snap_token' => $snapToken,
    //         'gross_amount' => $order->total,
    //         'status' => Payment::STATUS_PENDING,
    //     ]);
    //
    //     return back()->with('snap_token', $snapToken);
    // }

    public function store(Request $request, MidtransService $midtrans, ShippingService $shipping)
    {
        $data = $request->validate([
            'address_id' => ['required', 'exists:addresses,id'],
            'courier' => ['required', 'string'],
            'shipping_service' => ['required', 'string'],
            'shipping_cost' => ['require', 'integer', 'min:0'],
        ]);

        $cart = Auth::user()->cart()->with('items.book')->first();
        abort_if(! $cart || $cart->items->isEmpty(), 422, 'Keranjang Kosong');

        // pastikan alamat milik user
        $address = Auth::user()->addresses()->findOrFail($data['address_id']);

        // validsari ulang: semua buku masih tersedia
        $unavailable = $cart->item->filter(fn ($i) => $i->book->status !== 'available');
        if ($unavailable->isNotEmpty()) {
            return back()->with('error', 'Beberapa buku sudah terjual. Pastikan kembali Keranjang');
        }

        // hitung ulang ongkri di server agar tidak di manipulasi
        $shippingCost = $shipping->cost(
            destinationCityId: $address->city_id,
            weight: $cart->items->sum(fn ($i) => $i->book->weight ?? 500),
            courier: $data['courier'],
            service: $data['shipping_service']
        ) ?? $data['shipping_cost'];

        $order = DB::transaction(function () use ($cart, $address, $data, $shippingCost) {
            $subtotal = $cart->total();
            $order = Order::create([
                'user_id' => Auth::id(),
                'order_number' => 'INV-'.now()->format('YmHis').'-'.Auth::id(),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'total' => $subtotal + $shippingCost,
                'courier' => $data['courier'],
                'shipping_service' => $data['shipping_service'],
                // snapshot alamat agar tidak berubah kalo alamat diedit nanti
                'shipping_name' => $address->recipient_name,
                'shipping_phone' => $address->phone,
                'shipping_address' => $address->full_address,
                'shipping_city' => $address->city_name,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'book_id' => $item->book->id,
                    'title' => $item->book->title,
                    'price' => $item->book->price,
                ]);
            }

            return $order;
        });

        // generate snap token
        $snapToken = $midtrans->createSnapToken($order);

        $order->update(['update_token' => $snapToken]);

        // kirim token ke fe lewat flash hk
        return back()->with('snap_token', $snapToken)->with('order_id', $order->id);
    }
}
