<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): mixed
    {
        return $request->wantsJson()
            ? response()->json([], 201)
            : redirect()->route('home'); // customer baru -> homepage
    }
}
