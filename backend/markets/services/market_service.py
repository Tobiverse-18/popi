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


    response = requests.get(
        url,
        params=params,
        timeout=10,
    )


    response.raise_for_status()


    data = response.json()


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


    return markets