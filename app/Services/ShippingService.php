<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ShippingService
{
    // asumsi berat default per buku (gram); idealnya pakai kolom books.weight
    public const DEFAULT_WEIGHT_PER_ITEM = 1000;

    private string $baseUrl;

    private string $apiKey;

    private string $originCityId;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.rajaongkir.base_url'), '/');
        $this->apiKey = (string) config('services.rajaongkir.key');
        $this->originCityId = (string) config('services.rajaongkir.origin_city_id');
    }

    private function client()
    {
        return Http::withHeaders(['key' => $this->apiKey])->baseUrl($this->baseUrl);
    }

    /** Daftar provinsi (di-cache, jarang berubah). */
    public function provinces()
    {
        return Cache::remember('ongkir.provinces', now()->addDay(), fn () => $this->client()->get('/destination/province')->json('data', []));
    }

    /** Daftar kota per provinsi. */
    public function cities(string $provinceId): array
    {
        return Cache::remember("ongkir.cities.{$provinceId}", now()->addDay(), fn () => $this->client()->get('/destination/city', ['province_id' => $provinceId])->json('data', []));
    }

    /** Hitung ongkir; balikin daftar layanan + biaya per kurir. */
    public function cost(string $destinationCityId, int $weight, string $courier): array
    {
        return $this->client()->asForm()->post('/calculate/domestic-cost', [
            'origin' => $this->originCityId,
            'destination' => $destinationCityId,
            'weight' => max($weight, 1),
            'courier' => $courier, // mis. "jne", "jnt", "sicepat"
        ])->json('data', []);
    }
}
