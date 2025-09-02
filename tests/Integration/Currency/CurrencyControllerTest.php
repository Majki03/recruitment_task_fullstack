<?php

namespace App\Tests\Integration\Currency;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CurrencyControllerTest extends WebTestCase
{
    public function testGetCurrentRatesEndpoint(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/rates/current');

        $this->assertResponseIsSuccessful();
        $response = $client->getResponse();
        $this->assertJson($response->getContent());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertIsArray($responseData);
        
        // Sprawdzamy czy odpowiedź nie jest błędem i zawiera oczekiwane waluty
        if (isset($responseData[0]['code'])) {
            $this->assertContains($responseData[0]['code'], ['EUR', 'USD', 'CZK', 'IDR', 'BRL']);
            $this->assertArrayHasKey('rate_sell', $responseData[0]);
        }
    }

    public function testGetHistoricalRatesEndpoint(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/rates/historical?date=2024-01-15');

        $this->assertResponseIsSuccessful();
        $response = $client->getResponse();
        $this->assertJson($response->getContent());

        $responseData = json_decode($response->getContent(), true);
        $this->assertIsArray($responseData);
        $this->assertArrayHasKey('USD', $responseData);
        
        if (!empty($responseData['USD'])) {
            $this->assertArrayHasKey('date', $responseData['USD'][0]);
             $this->assertArrayHasKey('rate_avg', $responseData['USD'][0]);
        }
    }
}