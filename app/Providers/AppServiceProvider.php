<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Limits for the public ticket endpoints.
     *
     * Many real users can share one public IP (mobile-carrier NAT, offices, a
     * proxy), so IP-based limits are kept generous or avoided: a per-IP cap that
     * is fine for one person would lock out thousands of others behind the same
     * address. Chat endpoints are limited per ticket instead — the ticket ID is
     * effectively unguessable, so that is enough to stop abuse of a single chat.
     * Volumetric attacks belong at the edge (Cloudflare / load balancer / WAF).
     */
    protected function configureRateLimiting(): void
    {
        // Creating tickets: 10/min per logged-in user; guests share a generous per-IP ceiling.
        RateLimiter::for('ticket-create', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(10)->by('ticket-create:user:'.$request->user()->getAuthIdentifier())
                : Limit::perMinute(300)->by('ticket-create:ip:'.$request->ip());
        });

        // Chat polling (the browser polls every few seconds while the page is open).
        RateLimiter::for('ticket-poll', function (Request $request) {
            return Limit::perMinute(60)->by('ticket-poll:uid:'.$request->route('ticketUid'));
        });

        // Sending a chat message.
        RateLimiter::for('ticket-chat', function (Request $request) {
            return Limit::perMinute(30)->by('ticket-chat:uid:'.$request->route('ticketUid'));
        });
    }
}
