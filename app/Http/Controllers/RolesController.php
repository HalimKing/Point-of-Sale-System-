<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RolesController extends Controller
{
    //
    public function allRoles()
    {
        $roles = DB::select('select id, name from roles');
        return response()->json($roles);
    }
}
