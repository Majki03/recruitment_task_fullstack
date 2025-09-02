<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\NbpApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class CurrencyController extends AbstractController
{
    private NbpApiService $nbpApiService;

    public function __construct(NbpApiService $nbpApiService)
    {
        $this->nbpApiService = $nbpApiService;
    }

    public function getCurrentRates(): JsonResponse
    {
        $rates = $this->nbpApiService->getCurrentExchangeRates();
        return new JsonResponse($rates);
    }

    public function getHistoricalRates(Request $request): JsonResponse
    {
        $date = $request->query->get('date', 'today');
        $rates = $this->nbpApiService->getHistoricalExchangeRates($date);
        return new JsonResponse($rates);
    }
}