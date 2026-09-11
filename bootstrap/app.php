<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Database\QueryException $e, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            // SQLSTATE class 08 = Connection Exception
            // 涵蓋連線被拒、連線逾時、無法建立連線等連線層級失敗
            // 藉此跟真正的 SQL 語法錯誤區分開，避免誤判
            $isConnectionIssue = str_contains($e->getMessage(), 'SQLSTATE[08');

            if (! $isConnectionIssue) {
                return null;
            }

            return response()->json([
                'error' => 'database_unavailable',
                'message' => 'The database appears to be paused and requires manual restore.',
            ], 503);
        });
    })->create();