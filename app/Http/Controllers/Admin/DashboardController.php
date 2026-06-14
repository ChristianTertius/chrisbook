<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    // status yg dihitung sebagai penjualan sah
    private const PAID_STATUSES = ['paid', 'shipped', 'completed'];

    public function __invoke(Request $request)
    {
        return Inertia::render('Admin/Dashboard', [
            'cards' => $this->cards(),
            'salesChart' => $this->salesChart(),
            'topBook' => $this->topBook(),
            'lowStock' => $this->lowStock(),
            'recentOrders' => Order::with('user')->latest()->limit(8)->get(),
        ]);
    }

    // kartu ringkasan kpi
    private function cards(): array
    {
        $paid = fn() => Order::whereIn('status', self::PAID_STATUSES);

        return [
            'revenue_this_month' => $paid()
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total'),
            'revenue_total' => $paid()->sum('total'),
            'orders_total' => Order::count(),
            'orders_pending' => Order::where('status', 'pending')->count(),
            'books_available' => Book::where('status', 'available')->count(),
            'books_sold' => Book::where('status', 'sold')->count(),
        ];
    }


    // pendapatna dan jumlah order 12 bulan terakhir, untuk grafik
    public function index(): array
    {
        return Order::query()
            ->whereIn("status", self::PAID_STATUSES)
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month")
            ->selectRaw('SUM(total) as revenue')
            ->selectRaw('COUNT(*) as orders')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    // buku terlaris berdasarkan snapshot orders_item
    private function topBook(): array
    {
        return OrderItem::query()
            ->select('title')
            ->selectRaw('SUM(qty) as sold_qty')
            ->selectRaw('SUM(qty * price) as revenue')
            ->whereHas('order', fn($q) => $q->whereIn('status', self::PAID_STATUSES))
            ->groupBy('title')
            ->orderByDesc('sold_qty')
            ->limit(5)
            ->get()
            ->toArray();
    }

    // buku yg stock menipis
    function lowStock(): array
    {
        return Book::query()
            ->where('status', 'available')
            ->where('stock', '<=', 1)
            ->orderBy('stock')
            ->limit(10)
            ->get(['id', 'title', 'stock', 'slug'])
            ->toArray();
    }
}
