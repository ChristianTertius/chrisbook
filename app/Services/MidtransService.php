<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    // minta snap token untuk sebuah order
    public function createSnapToken($order): string
    {
        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => $order->total,
            ],
            'customer_details' => [
                'first_name' => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->user->phone,
            ],
            'item_details' => $order->items->map(fn($item) => [
                'id' => $item->product->id,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'name' => mb_substr($item->title, 0, 50),
            ])->toArray(),
        ];
        return Snap::getSnapToken($params);
    }

    // verifikasi keaslian notifikasi webhook
    public function isValidSignature(array $payload): bool
    {
        $expected = hash(
            'sha512',
            $payload['order_id']
                . $payload['status_code']
                . $payload['gross_amount']
                . config('services.midtrans.server_key')
        );

        return hash_equals($expected, $payload['signature_key'] ?? '');
    }
}
