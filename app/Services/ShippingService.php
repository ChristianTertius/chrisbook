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
        return Http::baseUrl(config('services.rajaongkir.base_url'))->withHeaders(['key' => config('services.rajaongkir.key')]);
    }

    /** Daftar provinsi (di-cache, jarang berubah). return: [{id, name}] */
    public function provinces()
    {
        // return Cache::remember('ongkir.provinces', now()->addDay(), fn() => $this->client()->get('/destination/province')->json('data', []));

        return Cache::remember('ro.provinces', now()->addDays(30), function () {
            $res = $this->client()->get('/destination/province')->throw()->json();

            return collect($res['data'] ?? [])->map(fn($p) => ['id' => (string) $p['id'], 'name' => $p['name']])->all();
        });
    }

    /** Daftar kota per provinsi. return [{id, name}] */
    public function cities(string $provinceId): array
    {
        // return Cache::remember("ongkir.cities.{$provinceId}", now()->addDay(), fn() => $this->client()->get('/destination/city', ['province_id' => $provinceId])->json('data', []));
        return Cache::remember("ro.cities.{$provinceId}", now()->addDays(30), function () use ($provinceId) {
            $res = $this->client()->get("/destination/city/{$provinceId}")->throw()->json();

            return collect($res['data'] ?? [])
                ->map(fn($c) => ['id' => (string) $c['id'], 'name' => $c['name']])
                ->all();
        });
    }

    public function options(string $destinationCiyId, int $weight): array
    {
        $res = $this->client()->asFForm()->post('/calculate/district/domestic-cost', [
            'origin' => config('services.rajaongkir.origin_city_id'),
            'destination' => $destinationCiyId,
            'weight' => max($weight, 1),
            'courier' => 'jne:jnt:sicepat:pos',
        ])->throw()->json();

        return collect($res['data'] ?? [])
            ->map(fn($o) => [
                'courier'     => strtolower($o['code'] ?? $o['courier'] ?? ''),
                'service'     => $o['service'] ?? '',
                'description' => $o['description'] ?? '',
                'cost'        => (int) ($o['cost'] ?? 0),
                'etd'         => $o['etd'] ?? null,
            ])
            ->all();
    }


    /** Hitung ongkir; balikin daftar layanan + biaya per kurir. */
    public function cost(string $destinationCityId, int $weight, string $courier, string $service): ?int
    {
        return collect($this->options($destinationCityId, $weight))
            ->first(fn($o) => $o['courier'] === strtolower($courier) && $o['service'] === $service)['cost'] ?? null;
    }
}
