<?php

declare(strict_types=1);

namespace App\Service;

use DateTime;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

class NbpApiService
{
    private const NBP_API_URL = 'http://api.nbp.pl/api/exchangerates/';
    private const CACHE_EXPIRATION = 3600; // Cache na 1 godzinę

    private Client $httpClient;
    private CacheInterface $cache;

    // Definicja walut i ich spreadów
    private array $currencies = [
        'EUR' => ['buy_spread' => 0.15, 'sell_spread' => 0.11],
        'USD' => ['buy_spread' => 0.15, 'sell_spread' => 0.11],
        'CZK' => ['buy_spread' => null, 'sell_spread' => 0.20],
        'IDR' => ['buy_spread' => null, 'sell_spread' => 0.20],
        'BRL' => ['buy_spread' => null, 'sell_spread' => 0.20],
    ];

    public function __construct(CacheInterface $cache)
    {
        $this->httpClient = new Client(['base_uri' => self::NBP_API_URL]);
        $this->cache = $cache;
    }

    /**
     * Pobiera i przetwarza aktualne kursy walut.
     */
    public function getCurrentExchangeRates(): array
    {
        $cacheKey = 'nbp_current_rates';

        return $this->cache->get($cacheKey, function (ItemInterface $item) {
            $item->expiresAfter(self::CACHE_EXPIRATION);

            try {
                $response = $this->httpClient->get('tables/A/?format=json');
                $data = json_decode((string) $response->getBody(), true);

                if (empty($data[0]['rates'])) {
                    return ['error' => 'Could not fetch current rates from NBP API.'];
                }

                return $this->processRates($data[0]['rates']);
            } catch (ClientException $e) {
                return ['error' => 'NBP API is currently unavailable.'];
            }
        });
    }

    /**
     * Pobiera i przetwarza historyczne kursy dla danej daty.
     */
    public function getHistoricalExchangeRates(string $dateString): array
    {
        $endDate = new DateTime($dateString);
        $startDate = (clone $endDate)->modify('-14 days');

        $currencyCodes = array_keys($this->currencies);
        $historicalData = [];

        foreach ($currencyCodes as $code) {
             $cacheKey = "nbp_historical_{$code}_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}";

             $rates = $this->cache->get($cacheKey, function(ItemInterface $item) use ($code, $startDate, $endDate) {
                $item->expiresAfter(self::CACHE_EXPIRATION * 24); //dłuższy cache dla danych historycznych
                 try {
                    $url = sprintf(
                        'rates/A/%s/%s/%s/?format=json',
                        $code,
                        $startDate->format('Y-m-d'),
                        $endDate->format('Y-m-d')
                    );
                    $response = $this->httpClient->get($url);
                    $data = json_decode((string) $response->getBody(), true);
                    // Przekazujemy dodatkowe informacje do processRates
                    return $this->processRates($data['rates'], $data['code'], $data['currency']);
                 } catch (ClientException $e) {
                     // NBP API zwraca 404, jeśli dla danego okresu nie ma danych (np. weekendy)
                     return [];
                 }
             });

            $historicalData[$code] = $rates;
        }

        return $historicalData;
    }

    /**
     * Przetwarza surowe dane z API, dodając logikę kantoru.
     * $codeOverride i $currencyNameOverride są używane dla danych historycznych.
     */
    private function processRates(array $rates, string $codeOverride = null, string $currencyNameOverride = null): array
    {
        $processedRates = [];
        $supportedCurrencies = array_keys($this->currencies);

        foreach ($rates as $rate) {
            $code = $codeOverride ?? $rate['code'];

            if (in_array($code, $supportedCurrencies)) {
                $avgRate = $rate['mid'];
                $spreads = $this->currencies[$code];

                $processedRates[] = [
                    'code' => $code,
                    'currency' => $currencyNameOverride ?? $rate['currency'],
                    'rate_avg' => $avgRate,
                    'rate_buy' => $spreads['buy_spread'] !== null ? round($avgRate - $spreads['buy_spread'], 4) : null,
                    'rate_sell' => round($avgRate + $spreads['sell_spread'], 4),
                    'date' => $rate['effectiveDate'] ?? null,
                ];
            }
        }
        return $processedRates;
    }
}