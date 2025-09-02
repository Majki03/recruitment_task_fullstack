import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CurrencyConverter from './CurrencyConverter'; // Importujemy nowy komponent

const CurrencyDashboard = () => {
    // ... (stany i funkcje, które już tu są, zostają bez zmian)
    const [currentRates, setCurrentRates] = useState([]);
    const [historicalRates, setHistoricalRates] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [loadingCurrent, setLoadingCurrent] = useState(true);
    const [loadingHistorical, setLoadingHistorical] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://telemedi-zadanie.localhost/api';

    useEffect(() => {
        setLoadingCurrent(true);
        axios.get(`${API_BASE_URL}/rates/current`)
            .then(response => {
                if (response.data.error) {
                    setError(response.data.error);
                } else {
                    setCurrentRates(response.data);
                }
                setLoadingCurrent(false);
            })
            .catch(err => {
                setError('Could not connect to the backend API.');
                setLoadingCurrent(false);
            });
    }, []);

    useEffect(() => {
        setLoadingHistorical(true);
        axios.get(`${API_BASE_URL}/rates/historical?date=${selectedDate}`)
            .then(response => {
                setHistoricalRates(response.data);
                setLoadingHistorical(false);
            })
            .catch(err => {
                setError('Could not fetch historical data.');
                setLoadingHistorical(false);
            });
    }, [selectedDate]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    if (error) {
        return <div className="alert alert-danger text-center mt-4">Error: {error}</div>;
    }

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Kantor - Kursy Walut</h1>

            {/* Nowy komponent kalkulatora dodany tutaj */}
            {!loadingCurrent && currentRates.length > 0 && (
                <div className="mb-4">
                    <CurrencyConverter rates={currentRates} />
                </div>
            )}

            <div className="card mb-4">
                <div className="card-header">
                    <h3>Aktualne kursy walut</h3>
                </div>
                <div className="card-body">
                    {loadingCurrent ? <p>Ładowanie...</p> : <CurrentRatesTable rates={currentRates} />}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Historia kursów (14 dni)</h3>
                </div>
                <div className="card-body">
                    <div className="form-group mb-3">
                        <label htmlFor="date-picker">Wybierz datę końcową:</label>
                        <input
                            type="date"
                            id="date-picker"
                            className="form-control"
                            value={selectedDate}
                            onChange={handleDateChange}
                        />
                    </div>
                    {loadingHistorical ? <p>Ładowanie historii...</p> : <HistoricalRatesDisplay data={historicalRates} />}
                </div>
            </div>
        </div>
    );
};

// ... (komponenty CurrentRatesTable i HistoricalRatesDisplay zostają bez zmian)
const CurrentRatesTable = ({ rates }) => (
    <table className="table table-striped table-hover">
        <thead>
            <tr>
                <th>Waluta</th>
                <th>Kod</th>
                <th>Kurs kupna</th>
                <th>Kurs sprzedaży</th>
                <th>Kurs średni NBP</th>
            </tr>
        </thead>
        <tbody>
            {rates.map(rate => (
                <tr key={rate.code}>
                    <td>{rate.currency}</td>
                    <td><strong>{rate.code}</strong></td>
                    <td className={rate.rate_buy ? 'text-success' : 'text-muted'}>{rate.rate_buy ? `${rate.rate_buy.toFixed(4)} PLN` : 'N/A'}</td>
                    <td className="text-danger">{rate.rate_sell.toFixed(4)} PLN</td>
                    <td>{rate.rate_avg.toFixed(4)} PLN</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const HistoricalRatesDisplay = ({ data }) => (
    <div>
        {Object.keys(data).map(currencyCode => (
            <div key={currencyCode} className="mb-3">
                <h4>{currencyCode}</h4>
                {data[currencyCode] && data[currencyCode].length > 0 ? (
                    <table className="table table-sm table-bordered">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Kurs średni NBP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data[currencyCode].slice().reverse().map(rate => (
                                <tr key={rate.date}>
                                    <td>{rate.date}</td>
                                    <td>{rate.rate_avg.toFixed(4)} PLN</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-muted">Brak danych dla tego okresu.</p>
                )}
            </div>
        ))}
    </div>
);


export default CurrencyDashboard;