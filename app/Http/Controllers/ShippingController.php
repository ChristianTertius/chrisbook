<?php

namespace App\Http\Controllers;

use App\Services\ShippingService;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function __construct(private ShippingService $shipping) {}

    public function provinces()
    {
        return response()->json($this->shipping->provinces());
    }

    public function cities(Request $request, ShippingService $shipping)
    {
        $request->validate(['province_id' => ['required', 'string']]);

        return response()->json(
            $shipping->cities($request->string('province_id')) // [{id, name}]
        );
    }

    public function cost(Request $request)
    {
        $data = $request->validate([
            'destination_city_id' => ['required'],
            'weight' => ['required', 'integer', 'min:1'],
            'courier' => ['required', 'string'],
        ]);

        return response()->json($this->shipping->cost($data['destination_city_id'], $data['weight'], $data['courier']));
    }

    // opsi ongkir sat checkout (berdasarkan alamat terpilih)
    public function options(Request $request, ShippingService $shipping)
    {
        $data = $request->validate([
            'city_id' => ['required', 'string'],
            'weight' => ['required', 'integer', 'min:1'],
        ]);

        return response()->json($shipping->options($data['city_id'], $data['weight']));
    }
}
