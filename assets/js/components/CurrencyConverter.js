import React, { useState } from 'react';

const CurrencyConverter = ({ rates }) => {
    // Stany komponentu
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState('EUR');
    const [toCurrency, setToCurrency] = useState('USD');
    const [result, setResult] = useState(null);

    // Lista dostępnych walut, rozszerzona o polskiego złotego (PLN)
    const availableCurrencies = [{ code: 'PLN', rate_avg: 1 }, ...rates];

    const handleConvert = (e) => {
        e.preventDefault();

        const fromRate = availableCurrencies.find(r => r.code === fromCurrency)?.rate_avg;
        const toRate = availableCurrencies.find(r => r.code === toCurrency)?.rate_avg;

        if (fromRate && toRate) {
            const convertedAmount = (amount * fromRate) / toRate;
            setResult(`${amount} ${fromCurrency} = ${convertedAmount.toFixed(4)} ${toCurrency}`);
        } else {
            setResult('Nie można było dokonać przeliczenia.');
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Kalkulator Walut</h3>
            </div>
            <div className="card-body">
                <form onSubmit={handleConvert}>
                    <div className="form-row align-items-end">
                        <div className="form-group col-md-3">
                            <label htmlFor="amount">Kwota</label>
                            <input
                                type="number"
                                id="amount"
                                className="form-control"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="form-group col-md-3">
                            <label htmlFor="fromCurrency">Z waluty</label>
                            <select id="fromCurrency" className="form-control" value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
                                {availableCurrencies.map(currency => (
                                    <option key={currency.code} value={currency.code}>{currency.code}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group col-md-3">
                            <label htmlFor="toCurrency">Na walutę</label>
                            <select id="toCurrency" className="form-control" value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
                                {availableCurrencies.map(currency => (
                                    <option key={currency.code} value={currency.code}>{currency.code}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group col-md-3">
                            <button type="submit" className="btn btn-primary btn-block">Przelicz</button>
                        </div>
                    </div>
                </form>
                {result && (
                    <div className="alert alert-success mt-3 text-center">
                        <strong>{result}</strong>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrencyConverter;