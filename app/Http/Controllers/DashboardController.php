<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.tickets.index');
        }

        // "id" as a tie-breaker so tickets created in the same second keep a
        // stable order across pages.
        $tickets = Ticket::where('user_id', $user->id)
            ->latest()
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Dashboard', [
            'tickets' => $tickets,
        ]);
    }
}
