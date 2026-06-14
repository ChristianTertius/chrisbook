<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddressRequest;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AddressController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Address/Index', [
            'addresses' => Auth::user()->addresses()->orderByDesc('is_default')->latest()->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            $user = Auth::user();

            // alamat pertama otomatis jadi default
            $makeDefault = $user->addresses()->count() === 0 || ($data['is_default'] ?? false);

            if ($makeDefault) {
                $user->addresses()->update(['is_default' => true]);
            }

            $user->addresses()->create([...$data, 'is_default' => $makeDefault]);
        });

        return back()->with('success', 'Alamat telah berhasil ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AddressRequest  $request, Address $address)
    {
        $this->authorizeOwner($address);
        $data = $request->validated();

        DB::transaction(function () use ($data, $address) {
            if ($data['is_default'] ?? false) {
                Auth::user()->addresses()
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }

            $address->update($data);
        });

        return back()->with('success', 'Alamat telah berhasil diubah');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Address $address)
    {
        $this->authorizeOwner($address);
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
}
