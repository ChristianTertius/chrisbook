<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Order;
use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MidtransWebHookController extends Controller
{
    public function handler(Request $request, MidtransService $midtrans)
    {
        $payload = $request->all();

        // verifikasi signature, tolak kalo palsu
        if (!$midtrans->isValidSignature($payload)) {
            abort(403, 'invalid signature');
        }

        $payment = Payment::where('midtrans_order_id', $payload['order_id'])->firstOrFail();
        $order = $payment->order;

        $transactionStatus = $payload['transaction_status'];
        $fraudStatus = $payload['fraud_status'] ?? null;

        DB::transaction(function () use ($payment, $order, $payload, $transactionStatus, $fraudStatus) {
            $payment->update([
                'status' => $transactionStatus,
                'transaction_id' => $payload['transaction_id'] ?? null,
                'payment_type' => $payload['payment_type'] ?? null,
                'raw_response' => $payload,
            ]);
        });

        // mapping status midtrans -> order
        if (in_array($transactionStatus, ['settlement', 'capture']) && $fraudStatus !== 'challenge') {
            $payment->update(['paid_at' => now()]);
            $order->update(['status' => Order::STATUS_PAID]);

            // buku sudah ditandai sold saat checkout; kirim email(queue)
            // OrderPaidNotification dispatch disini
        } elseif (in_array($transactionStatus, ['expire', 'cancel', 'deny'])) {
            $order->update(['status' => Order::STATUS_CANCELLED]);
            // kembalikan stock buku biar bisa di jual lagi
            $order->items->each(function ($item) {
                if ($item->book) {
                    $item->book->update(['status' => Book::STATUS_AVAILABLE]);
                }
            });
        }

        return response()->json(['message' => 'ok',]);
    }
}
