<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): mixed
    {
        $user = $request->user();

        // admin -> dashboard, selain itu (customer) -> homepage
        $target = $user->isAdmin() ? route('admin.dashboard') : '/';

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->to($target);
    }
}
