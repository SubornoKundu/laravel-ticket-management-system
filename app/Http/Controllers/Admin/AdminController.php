<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * List every admin account.
     */
    public function index(): Response
    {
        return Inertia::render('admin/Admins', [
            'admins' => User::query()
                ->where('role', 'admin')
                ->orderBy('created_at')
                ->get(['id', 'name', 'email', 'created_at']),
        ]);
    }

    /**
     * Create a new admin account.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ]);

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(),
            'role' => 'admin',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Admin added.')]);

        return back();
    }

    /**
     * Remove an admin account. An admin can't remove themselves, and the
     * last remaining admin can't be removed — the panel must always stay
     * accessible to at least one admin.
     */
    public function destroy(Request $request, User $admin): RedirectResponse
    {
        if ($admin->role !== 'admin') {
            abort(404);
        }

        if ($admin->id === Auth::id()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __("You can't remove your own admin account.")]);

            return back();
        }

        if (User::where('role', 'admin')->count() <= 1) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('At least one admin must remain.')]);

            return back();
        }

        // Tickets this admin had claimed would otherwise be left stuck in
        // "Taken" with no assignee once the account is gone (the DB only
        // nulls assigned_admin_id, it doesn't revert the status). Reopen
        // them so any admin can pick them back up.
        $reopened = Ticket::where('assigned_admin_id', $admin->id)
            ->where('status', TicketStatus::Taken->value)
            ->update([
                'status' => TicketStatus::Pending->value,
                'assigned_admin_id' => null,
            ]);

        $admin->delete();

        $message = $reopened > 0
            ? __('Admin removed. :count of their claimed ticket(s) were reopened.', ['count' => $reopened])
            : __('Admin removed.');

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }
}
