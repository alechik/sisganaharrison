<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\DashboardRequest;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    public function show(DashboardRequest $request): JsonResponse
    {
        [$desde, $hasta] = $request->periodo();

        return response()->json([
            'data' => $this->dashboardService->summary($desde, $hasta),
        ]);
    }
}
