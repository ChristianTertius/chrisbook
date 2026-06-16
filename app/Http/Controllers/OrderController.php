<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Orders/Index', [
            'orders' => Auth::user()->orders()->with('payment')->latest()->paginate(10),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        // pastikan order milik user yg login
        abort_unless($order->user_id === Auth::id(), 403);

        return Inertia::render('Orders/Show', [
            'order' => $order->load('items.book', 'payment'),
        ]);
    }
}
