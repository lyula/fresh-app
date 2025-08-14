// Utility for currency conversion and formatting
export const COUNTRY_CURRENCIES = {
  "United States": { code: "USD", symbol: "$" },
  "United Kingdom": { code: "GBP", symbol: "£" },
  "Canada": { code: "CAD", symbol: "C$" },
  "Germany": { code: "EUR", symbol: "€" },
  "France": { code: "EUR", symbol: "€" },
  "Japan": { code: "JPY", symbol: "¥" },
  "Australia": { code: "AUD", symbol: "A$" },
  "Italy": { code: "EUR", symbol: "€" },
  "Spain": { code: "EUR", symbol: "€" },
  "Netherlands": { code: "EUR", symbol: "€" },
  "Sweden": { code: "SEK", symbol: "kr" },
  "Switzerland": { code: "CHF", symbol: "Fr" },
  "Norway": { code: "NOK", symbol: "kr" },
  "Finland": { code: "EUR", symbol: "€" },
  "Denmark": { code: "DKK", symbol: "kr" },
  "Belgium": { code: "EUR", symbol: "€" },
  "Austria": { code: "EUR", symbol: "€" },
  "Ireland": { code: "EUR", symbol: "€" },
  "New Zealand": { code: "NZD", symbol: "NZ$" },
  "Kenya": { code: "KES", symbol: "KES" },
  "Uganda": { code: "UGX", symbol: "USh" },
  "Nigeria": { code: "NGN", symbol: "₦" },
  "South Africa": { code: "ZAR", symbol: "R" },
  "India": { code: "INR", symbol: "₹" },
  "Brazil": { code: "BRL", symbol: "R$" },
  "China": { code: "CNY", symbol: "¥" },
  "Russia": { code: "RUB", symbol: "₽" },
  "Mexico": { code: "MXN", symbol: "$" },
  "Turkey": { code: "TRY", symbol: "₺" },
  "Egypt": { code: "EGP", symbol: "£" },
  "Ghana": { code: "GHS", symbol: "₵" },
  "Tanzania": { code: "TZS", symbol: "TSh" },
  "Rwanda": { code: "RWF", symbol: "RF" },
};

export function getUserCurrency(userCountry) {
  return COUNTRY_CURRENCIES[userCountry] || COUNTRY_CURRENCIES["United States"];
}

export function convertFromUSD(usdAmount, userCountry, exchangeRates) {
  const currency = getUserCurrency(userCountry);
  const rate = exchangeRates[currency.code] || 1;
  return usdAmount * rate;
}

export function formatCurrency(usdAmount, currencyMode, userCountry, exchangeRates) {
  if (currencyMode === 'usd') {
    return `$${usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  const currency = getUserCurrency(userCountry);
  const convertedAmount = convertFromUSD(usdAmount, userCountry, exchangeRates);
  let formattedAmount;
  if (currency.code === 'JPY' || currency.code === 'KRW') {
    formattedAmount = Math.round(convertedAmount).toLocaleString();
  } else {
    formattedAmount = convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return `${currency.symbol}${formattedAmount}`;
}
