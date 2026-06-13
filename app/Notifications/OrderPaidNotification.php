<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPaidNotification extends Notification
{
    use Queueable;

    // dispatch hanya setelah DB transaction commit (lihat catatan)
    public bool $afterCommit = true;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Order $order) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $order = $this->order;
        $mail = (new MailMessage)
            ->subject("Pembayaran diterima - {$order->order_number}")
            ->greeting("Halo {$notifiable->name},")
            ->line("Pembayaran untuk pesanan {$order->order_number} sudah kami terima. Terima Kasih")
            ->line("Ringkasan pesanan:");

        foreach ($order->items as $item) {
            $mail->line("• {$item->title} — Rp" . number_format($item->price, 0, ',', '.'));
        }

        return $mail
            ->line('Total: Rp' . number_format($order->total, 0, ',', '.'))
            ->action('Lihat Pesanan', url('/orders/' . $order->id))
            ->line('Pesananmu akan segera kami proses untuk pengiriman.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
