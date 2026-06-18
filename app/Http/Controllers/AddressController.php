<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Services\ShippingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AddressController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(ShippingService $shipping)
    {
        return Inertia::render('addresses/index', [
            'addresses' => Auth::user()->addresses()->latest()->get(),
            'provinces' => $shipping->provinces() ?? [],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $this->validateData($request);

        DB::transaction(function () use ($data) {
            $address = Auth::user()->addresses()->create($data);
            $this->syncDefault($address, $data['is_default'] ?? false);
        });

        return back()->with('success', 'Alamat telah berhasil ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Address $address)
    {
        abort_unless($address->user_id === Auth::id(), 403);

        $data = $this->validateData($request);

        DB::transaction(function () use ($address, $data) {
            $address->update($data);
            $this->syncDefault($address, $data['is_default'] ?? false);
        });

        return back()->with('success', 'Alamat telah berhasil diubah');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Address $address)
    {
        abort_unless($address->user_id === Auth::id(), 403);
        $address->delete();

        return back()->with('success', 'Alamat telah berhasil dihapus');
    }

    public function setDefault(Address $address)
    {
        $this->authorizeOwner($address);

        DB::transaction(function () use ($address) {
            Auth::user()->addresses()->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        return back()->with('success', 'Alamat telah berhasil diatur sebagai default');
    }

    private function authorizeOwner(Address $address)
    {
        abort_unless($address->user_id === Auth::id(), 403);
    }

    private function syncDefault(Address $address, bool $isDefault): void
    {
        if ($isDefault) {
            Auth::user()->addresses()
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'full_address' => ['required', 'string'],
            'province_id' => ['required', 'string'],
            'province_name' => ['required', 'string'],
            'city_id' => ['required', 'string'],
            'city_name' => ['required', 'string'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'is_default' => ['boolean'],
        ]);
    }
}
