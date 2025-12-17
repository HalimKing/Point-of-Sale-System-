<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectUserByRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If user is not authenticated, continue normally
        if (!auth()->check()) {
            return $next($request);
        }
        

        // Define routes that should not be redirected (allowed to access)
        $exemptRoutes = [
            'logout',
            // 'cashier.dashboard', // The dashboard route itself
            'api.*', // API routes if any
        ];

        // Check if current route is exempt from redirection
        foreach ($exemptRoutes as $exemptRoute) {
            if ($request->routeIs($exemptRoute)) {
                return $next($request);
            }
        }

        // Get user role
        $role = auth()->user()->role_id;

        // Define role-specific dashboards
        $roleDashboards = [
            3 => 'cashier.dashboard',
            1 => 'admin.dashboard',
            2 => 'admin.dashboard',
            // 3 => 'manager.dashboard',
            // Add more roles as needed
        ];
      

        // If user is already on their correct dashboard route, continue
        if (isset($roleDashboards[$role]) && $request->routeIs($roleDashboards[$role])) {
            return $next($request);
        }

        // Redirect to appropriate dashboard based on role
        if (isset($roleDashboards[$role])) {
            return redirect()->route($roleDashboards[$role]);
        }

        // For users without a defined role dashboard, continue normally
        return $next($request);
    }
}