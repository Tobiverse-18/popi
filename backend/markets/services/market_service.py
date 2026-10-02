import requests

from django.core.cache import cache


COINPAPRIKA_URL = "https://api.coinpaprika.com/v1/tickers"

CACHE_KEY = "baloz_market_prices"
CACHE_TIMEOUT = 60


COINS = {
    "btc-bitcoin": {
        "symbol": "BTC",
        "name": "Bitcoin",
    },
    "eth-ethereum": {
        "symbol": "ETH",
        "name": "Ethereum",
    },
    "sol-solana": {
        "symbol": "SOL",
        "name": "Solana",
    },
    "bnb-binance-coin": {
        "symbol": "BNB",
        "name": "BNB",
    },
    "xrp-xrp": {
        "symbol": "XRP",
        "name": "XRP",
    },
    "usdt-tether": {
        "symbol": "USDT",
        "name": "Tether",
    },
}


def get_market_data():
    """
    Get simple cryptocurrency market data.

    Returns:
        [
            {
                "id": "btc-bitcoin",
                "symbol": "BTC",
                "name": "Bitcoin",
                "price": 100000.00,
                "change_24h": 2.45,
            },
            ...
        ]
    """

    # ---------------------------------------------------------
    # 1. Check cache first
    # ---------------------------------------------------------

    cached_data = cache.get(CACHE_KEY)

    if cached_data is not None:
        return cached_data

    # ---------------------------------------------------------
    # 2. Request market data from CoinPaprika
    # ---------------------------------------------------------

    try:
        response = requests.get(
            COINPAPRIKA_URL,
            params={
                "quotes": "USD",
            },
            timeout=15,
        )

        response.raise_for_status()

        coins = response.json()

    except requests.RequestException as exc:
        print(f"CoinPaprika request failed: {exc}")

        # If the provider is temporarily unavailable,
        # return an empty list instead of crashing the API.
        return []

    # ---------------------------------------------------------
    # 3. Create lookup for the coins we actually need
    # ---------------------------------------------------------

    requested_ids = set(COINS.keys())

    market_data = []

    for coin in coins:

        coin_id = coin.get("id")

        if coin_id not in requested_ids:
            continue

        coin_info = COINS[coin_id]

        usd_data = (
            coin.get("quotes", {})
            .get("USD", {})
        )

        price = usd_data.get("price")
        change_24h = usd_data.get(
            "percent_change_24h"
        )

        if price is None:
            continue

        market_data.append(
            {
                "id": coin_id,
                "symbol": coin_info["symbol"],
                "name": coin_info["name"],
                "price": float(price),
                "change_24h": (
                    float(change_24h)
                    if change_24h is not None
                    else 0.0
                ),
            }
        )

    # ---------------------------------------------------------
    # 4. Keep the assets in our desired order
    # ---------------------------------------------------------

    order = list(COINS.keys())

    market_data.sort(
        key=lambda item: order.index(item["id"])
    )

    # ---------------------------------------------------------
    # 5. Cache successful data
    # ---------------------------------------------------------

    if market_data:
        cache.set(
            CACHE_KEY,
            market_data,
            CACHE_TIMEOUT,
        )

    return market_data