<?php

use App\Models\User;

test('guests hitting the home page are sent to the login page', function () {
    $this->get(route('home'))->assertRedirect(route('login'));
});

test('logged-in users hitting the home page are sent to their dashboard', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('home'))->assertRedirect(route('dashboard'));
});
