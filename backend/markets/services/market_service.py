import requests

from django.core.cache import cache


COINS = {
    "bitcoin": {
        "symbol": "BTC",
        "name": "Bitcoin",
    },
    "ethereum": {
        "symbol": "ETH",
        "name": "Ethereum",
    },
    "solana": {
        "symbol": "SOL",
        "name": "Solana",
    },
    "binancecoin": {
        "symbol": "BNB",
        "name": "BNB",
    },
    "ripple": {
        "symbol": "XRP",
        "name": "XRP",
    },
    "tether": {
        "symbol": "USDT",
        "name": "Tether",
    },
}


CACHE_KEY = "baloz_market_data"
CACHE_TIMEOUT = 300

FALLBACK_CACHE_KEY = "baloz_market_data_fallback"
FALLBACK_CACHE_TIMEOUT = 60 * 60 * 24


def get_market_data():
    cached_markets = cache.get(CACHE_KEY)

    if cached_markets is not None:
        return cached_markets

    coin_ids = ",".join(COINS.keys())

    url = "https://api.coingecko.com/api/v3/coins/markets"

    params = {
        "vs_currency": "usd",
        "ids": coin_ids,
        "order": "market_cap_desc",
        "per_page": len(COINS),
        "page": 1,
        "sparkline": "true",
        "price_change_percentage": "24h",
    }

    headers = {
        "Accept": "application/json",
        "User-Agent": "Baloz/1.0",
    }

    try:
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException as error:
        print(f"CoinGecko request failed: {error}")

        fallback_markets = cache.get(
            FALLBACK_CACHE_KEY
        )

        if fallback_markets is not None:
            print(
                "Returning previously cached market data."
            )

            cache.set(
                CACHE_KEY,
                fallback_markets,
                CACHE_TIMEOUT,
            )

            return fallback_markets

        raise

    markets = []

    for coin in data:
        coin_id = coin.get("id")

        coin_info = COINS.get(coin_id)

        if not coin_info:
            continue

        markets.append(
            {
                "id": coin_id,
                "symbol": coin_info["symbol"],
                "name": coin_info["name"],
                "current_price": coin.get(
                    "current_price"
                ),
                "price_change_percentage_24h": coin.get(
                    "price_change_percentage_24h"
                ),
                "high_24h": coin.get(
                    "high_24h"
                ),
                "low_24h": coin.get(
                    "low_24h"
                ),
                "market_cap": coin.get(
                    "market_cap"
                ),
                "total_volume": coin.get(
                    "total_volume"
                ),
                "sparkline": coin.get(
                    "sparkline_in_7d",
                    {}
                ).get(
                    "price",
                    []
                ),
            }
        )

    cache.set(
        CACHE_KEY,
        markets,
        CACHE_TIMEOUT,
    )

    cache.set(
        FALLBACK_CACHE_KEY,
        markets,
        FALLBACK_CACHE_TIMEOUT,
    )

    return markets