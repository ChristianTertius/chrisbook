<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderStatusRequest;
use App\Models\Order;
use App\Notifications\OrderShippedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    // transisi status yg diizinkan (state machine)
    private const TRANSITIONS = [
        'pending' => ['cancelled'],
        'paid' => ['shipped', 'cancelled'],
        'shipped' => ['completed'],
        'completed' => [],
        'cancelled' => [],
    ];

    public function index(Request $request)
    {
        $orders = Order::query()
            ->with(['user', 'payment'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, fn ($q, $s) => $q->where(fn ($q) => $q->where('order_number', 'like', "%{$s}%")
                ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$s}%"))))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
            // ringkasan cepat buat header dashboard
            'stats' => [
                'pending' => Order::where('status', 'pending')->count(),
                'paid' => Order::where('status', 'paid')->count(),
                'shipped' => Order::where('status', 'shipped')->count(),
            ],

        ]);
    }

    public function show(Order $order)
    {
        return Inertia::render('Admin/Orders/Show', [
            'order' => $order->load('items.book', 'user', 'payment'),
            'allowedTransitions' => self::TRANSITIONS[$order->status] ?? [],
        ]);
    }

    public function update(OrderStatusRequest $request, Order $order)
    {
        $data = $request->validated();
        $newStatus = $data['status'];

        // tolak transisi status yg tidak valid
        $allowed = self::TRANSITIONS[$order->status] ?? [];
        abort_unless(in_array($newStatus, $allowed), 422, "Transisi {$order->status} -> {$newStatus} tidak diizinkan");

        $order->update([
            'status' => $newStatus,
            'courier' => $data['courier'] ?? $order->courier,
            'tracking_number' => $data['tracking_number'] ?? $order->tracking_number,
        ]);

        // beritahu user kalo pesanan sudah dikirim
        if ($newStatus == 'shipped') {
            $order->user->notify(new OrderShippedNotification($order));
        }

        return back()->with('success', "Status pesanan diperbarui jadi {$newStatus}.");
    }
}
