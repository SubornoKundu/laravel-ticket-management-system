<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| cPanel deployment note
|--------------------------------------------------------------------------
|
| On shared hosting (cPanel), the domain's document root is public_html,
| but Laravel's app code (vendor/, bootstrap/, storage/, etc.) must live
| OUTSIDE public_html for security. So the full project is uploaded to a
| sibling folder next to public_html:
|
|   /home/yourusername/test          <- full project (this repo)
|   /home/yourusername/public_html   <- ONLY the contents of this
|                                        deploy_public/ folder go here
|
| If you ever rename that "test" folder to something else, update every
| "../test" below to match.
|
*/
const APP_PATH = __DIR__.'/../test';

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = APP_PATH.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require APP_PATH.'/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once APP_PATH.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
