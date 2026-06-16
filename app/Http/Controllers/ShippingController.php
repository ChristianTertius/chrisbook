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

    public function cities(Request $request)
    {
        $request->validate(['province_id' => ['required']]);

        return response()->json($this->shipping->cities($request->province_id));
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
}
