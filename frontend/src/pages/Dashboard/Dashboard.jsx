import {
  Activity,
  ArrowUpFromLine,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Eye,
  EyeOff,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../../api/api";

import "./Dashboard.css";


const fallbackAssets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "S",
  },
  {
    symbol: "BNB",
    name: "BNB",
    icon: "◆",
  },
  {
    symbol: "XRP",
    name: "XRP",
    icon: "X",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "₮",
  },
];


const formatPrice = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }

  if (value >= 1000) {
    return `$${Number(value).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  if (value >= 1) {
    return `$${Number(value).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }
    )}`;
  }

  return `$${Number(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }
  )}`;
};


const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }

  const number = Number(value);

  if (number > 0) {
    return `+${number.toFixed(2)}%`;
  }

  return `${number.toFixed(2)}%`;
};


const formatWalletBalance = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }

  return `$${Number(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};


const formatInvestmentMoney = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return `$${Number(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};


const formatInvestmentDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};


export default function Dashboard() {
  const [balanceVisible, setBalanceVisible] =
    useState(true);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [activeMarket, setActiveMarket] =
    useState("All");

  const [watchlisted, setWatchlisted] =
    useState([]);

  const [markets, setMarkets] =
    useState([]);

  const [marketsLoading, setMarketsLoading] =
    useState(true);

  const [marketsError, setMarketsError] =
    useState(false);

  const [walletBalance, setWalletBalance] =
    useState(null);

  const [walletLoading, setWalletLoading] =
    useState(true);

  const [walletError, setWalletError] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [userLoading, setUserLoading] =
    useState(true);

  const [investments, setInvestments] =
    useState([]);

  const [
    investmentsLoading,
    setInvestmentsLoading,
  ] = useState(true);

  const [
    investmentsError,
    setInvestmentsError,
  ] = useState(false);


  const fetchMarkets = async () => {
    try {
      setMarketsError(false);

      const response = await api.get(
        "/markets/"
      );

      setMarkets(
        response.data?.markets || []
      );
    } catch (error) {
      console.error(
        "Failed to load market data:",
        error
      );

      setMarketsError(true);
    } finally {
      setMarketsLoading(false);
    }
  };


  const fetchWallet = async () => {
    try {
      setWalletError(false);

      const response = await api.get(
        "/wallet/"
      );

      setWalletBalance(
        response.data?.balance ?? null
      );
    } catch (error) {
      console.error(
        "Failed to load wallet:",
        error
      );

      setWalletError(true);
    } finally {
      setWalletLoading(false);
    }
  };


  const fetchUser = async () => {
    try {
      setUserLoading(true);

      const response = await api.get(
        "/users/me/"
      );

      setUser(response.data);
    } catch (error) {
      console.error(
        "Failed to load user:",
        error
      );
    } finally {
      setUserLoading(false);
    }
  };


  const fetchInvestments = async () => {
    try {
      setInvestmentsError(false);

      const response = await api.get(
        "/investments/"
      );

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      setInvestments(data);
    } catch (error) {
      console.error(
        "Failed to load investments:",
        error
      );

      setInvestmentsError(true);
    } finally {
      setInvestmentsLoading(false);
    }
  };


  useEffect(() => {
    fetchMarkets();
    fetchWallet();
    fetchUser();
    fetchInvestments();

    const interval = setInterval(() => {
      fetchMarkets();
      fetchWallet();
      fetchInvestments();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  const toggleWatchlist = (symbol) => {
    setWatchlisted((current) => {
      if (current.includes(symbol)) {
        return current.filter(
          (item) => item !== symbol
        );
      }

      return [...current, symbol];
    });
  };


  const getAssetMeta = (symbol) => {
    return (
      fallbackAssets.find(
        (asset) =>
          asset.symbol === symbol
      ) || {
        symbol,
        name: symbol,
        icon: symbol.charAt(0),
      }
    );
  };


  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    window.location.href = "/login";
  };


  const visibleAssets =
    activeMarket === "Watchlist"
      ? markets.filter((asset) =>
          watchlisted.includes(
            asset.symbol
          )
        )
      : markets;


  const allActiveInvestments =
    investments.filter(
      (investment) =>
        investment.status?.toLowerCase() ===
        "active"
    );


  const activeInvestments =
    allActiveInvestments.slice(0, 3);


  const displayName =
    user?.first_name ||
    user?.email?.split("@")[0] ||
    "there";


  return (
    <div className="baloz-dashboard">


      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="baloz-mobile-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`baloz-sidebar ${
          mobileMenuOpen
            ? "baloz-sidebar-open"
            : ""
        }`}
      >

        <div className="baloz-sidebar-brand">

          <Link
            to="/dashboard"
            className="baloz-brand"
          >
            <span className="baloz-brand-mark">
              B
            </span>

            <span className="baloz-brand-name">
              Baloz
            </span>
          </Link>


          <button
            type="button"
            className="baloz-mobile-close"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            ×
          </button>

        </div>


        <div className="baloz-sidebar-section">

          <span className="baloz-sidebar-title">
            OVERVIEW
          </span>


          <Link
            to="/dashboard"
            className="baloz-sidebar-link baloz-sidebar-link-active"
          >
            <Activity size={17} />
            <span>Overview</span>
          </Link>


          <Link
            to="/investments"
            className="baloz-sidebar-link"
          >
            <TrendingUp size={17} />
            <span>Investments</span>
          </Link>


          <Link
            to="/transactions"
            className="baloz-sidebar-link"
          >
            <ArrowUpFromLine size={17} />
            <span>Transactions</span>
          </Link>


          <Link
            to="/active-investments"
            className="baloz-sidebar-link"
          >
            <TrendingUp size={17} />
            <span>Active Investments</span>
          </Link>

        </div>


        <div className="baloz-sidebar-section">

          <span className="baloz-sidebar-title">
            ACCOUNT
          </span>


          <Link
            to="/settings"
            className="baloz-sidebar-link"
          >
            <Settings size={17} />
            <span>Settings</span>
          </Link>


          <button
            type="button"
            className="baloz-sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />

            <span>
              Log out
            </span>
          </button>

        </div>


        <div className="baloz-sidebar-bottom">

          <div className="baloz-sidebar-status">

            <span className="baloz-status-dot" />

            <div>

              <strong>
                Markets
              </strong>

              <span>
                Live data connection
              </span>

            </div>

          </div>


          <span className="baloz-sidebar-version">
            Baloz Financial Platform
          </span>

        </div>

      </aside>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="baloz-dashboard-main">


        {/* ====================================================
            TOPBAR
        ==================================================== */}

        <header className="baloz-topbar">

          <div className="baloz-topbar-left">

            <button
              type="button"
              className="baloz-mobile-menu"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>


            <nav className="baloz-top-navigation">

              <Link
                to="/dashboard"
                className="baloz-top-link baloz-top-link-active"
              >
                Baloz
              </Link>


            </nav>

          </div>


          <div className="baloz-topbar-right">

            <button
              type="button"
              className="baloz-top-profile"
            >
              <span>
                {displayName
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </button>

          </div>

        </header>


        {/* ====================================================
            CONTENT
        ==================================================== */}

        <main className="baloz-content">


          {/* ==================================================
              WELCOME / ACCOUNT HEADER
          ================================================== */}

          <section className="baloz-portfolio-header">

            <div className="baloz-portfolio-heading">

              <h1 className="baloz-welcome-heading">
              Welcome back, {displayName}
            </h1>


              <div className="baloz-balance-row">

                <div className="baloz-balance-row">

                  <h1>
                    {balanceVisible
                      ? walletLoading
                        ? "Loading..."
                        : walletError
                        ? "—"
                        : formatWalletBalance(
                            walletBalance
                          )
                      : "••••••"}
                  </h1>


                  <button
                    type="button"
                    className={
                      walletLoading
                        ? "baloz-wallet-refresh-button baloz-wallet-refreshing"
                        : "baloz-wallet-refresh-button"
                    }
                    onClick={() => {
                      setWalletLoading(
                        true
                      );

                      fetchWallet();
                    }}
                    disabled={walletLoading}
                    title="Refresh wallet balance"
                    aria-label="Refresh wallet balance"
                  >
                    <RefreshCw size={15} />
                  </button>

                </div>


                <button
                  type="button"
                  className="baloz-balance-eye"
                  onClick={() =>
                    setBalanceVisible(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    balanceVisible
                      ? "Hide balance"
                      : "Show balance"
                  }
                >
                  {balanceVisible ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>

              </div>


              <div className="baloz-balance-meta">

                <span>
                  Available balance
                </span>

                <span className="baloz-neutral-change">
                  —
                </span>

                <span>
                  Today
                </span>

              </div>

            </div>


            <div className="baloz-portfolio-actions">

              <Link
                to="/deposit"
                className="baloz-primary-action"
              >
                <Plus size={16} />
                Deposit
              </Link>


              <Link
                to="/withdraw"
                className="baloz-secondary-action"
              >
                <ArrowUpFromLine size={16} />
                Withdraw
              </Link>


              <Link
                to="/transactions"
                className="baloz-sidebar-link"
              >
                <ArrowUpFromLine size={17} />
                <span>
                  Transactions
                </span>
              </Link>

            </div>

          </section>


          {/* ==================================================
              LIVE MARKET TICKER
          ================================================== */}

          <section className="baloz-market-ticker">

            <div className="baloz-ticker-label">
              <span className="baloz-live-dot" />
              Markets
            </div>

            <div className="baloz-ticker-items">

              {marketsLoading ? (

                <div className="baloz-ticker-loading">
                  Loading live markets...
                </div>

              ) : marketsError ? (

                <div className="baloz-ticker-loading">
                  Market data unavailable
                </div>

              ) : markets.length > 0 ? (

                markets.slice(0, 5).map((asset) => (

                  <div
                    className="baloz-ticker-item"
                    key={asset.id}
                  >

                    <span className="baloz-ticker-symbol">
                      {asset.symbol}
                    </span>

                    <span className="baloz-ticker-price">
                      {formatPrice(
                        asset.price
                      )}
                    </span>

                    <span
                      className={
                        Number(
                          asset.change_24h
                        ) >= 0
                          ? "baloz-ticker-positive"
                          : "baloz-ticker-negative"
                      }
                    >
                      {formatPercentage(
                        asset.change_24h
                      )}
                    </span>

                  </div>

                ))

              ) : (

                <div className="baloz-ticker-loading">
                  No market data available
                </div>

              )}

            </div>

          </section>


          {/* ==================================================
              PRIMARY GRID
          ================================================== */}

          <section className="baloz-primary-grid">


            {/* ================================================
                ACTIVE INVESTMENTS
            ================================================= */}

            <div className="baloz-performance-panel">

              <div className="baloz-panel-header">

                <div>

                  <span className="baloz-overline">
                    INVESTMENTS
                  </span>

                  <h2>
                    Active investments
                  </h2>

                </div>


                <Link
                  to="/active-investments"
                  className="baloz-section-link"
                >
                  View all
                  <ChevronRight size={15} />
                </Link>

              </div>


              <div className="baloz-dashboard-investments">

                {investmentsLoading ? (

                  <div className="baloz-dashboard-investment-state">
                    <RefreshCw size={18} />
                    <span>
                      Loading investments...
                    </span>
                  </div>

                ) : investmentsError ? (

                  <div className="baloz-dashboard-investment-state">
                    <span>
                      Unable to load investments.
                    </span>

                    <button
                      type="button"
                      onClick={fetchInvestments}
                    >
                      Try again
                    </button>
                  </div>

                ) : activeInvestments.length === 0 ? (

                  <div className="baloz-dashboard-investment-empty">

                    <div className="baloz-empty-icon">
                      <TrendingUp size={20} />
                    </div>

                    <strong>
                      No active investments
                    </strong>

                    <span>
                      Your current investments
                      will appear here.
                    </span>

                    <Link
                      to="/investments"
                      className="baloz-dashboard-investment-button"
                    >
                      Explore investments
                      <ChevronRight size={15} />
                    </Link>

                  </div>

                ) : (

                  <div className="baloz-dashboard-investment-list">

                    {activeInvestments.map(
                      (investment) => (
                        <Link
                          key={investment.id}
                          to={`/active-investments/${investment.reference}`}
                          className="baloz-dashboard-investment-row"
                        >

                          <div className="baloz-dashboard-investment-icon">
                            <TrendingUp size={17} />
                          </div>


                          <div className="baloz-dashboard-investment-name">

                            <strong>
                              {investment.category_name}
                            </strong>

                            <span>
                              {investment.plan_name}
                            </span>

                          </div>


                          <div className="baloz-dashboard-investment-amount">

                            <span>
                              Invested
                            </span>

                            <strong>
                              {investment.currency}{" "}
                              {Number(
                                investment.principal_amount
                              ).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </strong>

                          </div>


                          <div className="baloz-dashboard-investment-profit">

                            <span>
                              Expected profit
                            </span>

                            <strong>
                              {investment.currency}{" "}
                              {Number(
                                investment.return_amount
                              ).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </strong>

                          </div>


                          <div className="baloz-dashboard-investment-maturity">

                            <span>
                              Maturity
                            </span>

                            <strong>
                              {formatInvestmentDate(
                                investment.maturity_date
                              )}
                            </strong>

                          </div>


                          <ChevronRight
                            size={16}
                            className="baloz-dashboard-investment-arrow"
                          />

                        </Link>
                      )
                    )}

                  </div>

                )}

              </div>

            </div>


            {/* ================================================
                SUMMARY
            ================================================= */}

            <aside className="baloz-summary-panel">

              <div className="baloz-panel-header">

                <div>

                  <span className="baloz-overline">
                    ACCOUNT
                  </span>

                  <h2>
                    Summary
                  </h2>

                </div>

              </div>


              <div className="baloz-summary-list">

                <div className="baloz-summary-row">

                  <span>
                    Available balance
                  </span>

                  <strong>
                    {walletLoading
                      ? "Loading..."
                      : walletError
                      ? "—"
                      : formatWalletBalance(
                          walletBalance
                        )}
                  </strong>

                </div>


                <div className="baloz-summary-row">

                  <span>
                    Invested
                  </span>

                  <strong>
                    {formatInvestmentMoney(
                      allActiveInvestments.reduce(
                        (total, investment) =>
                          total +
                          Number(
                            investment.principal_amount ||
                              0
                          ),
                        0
                      )
                    )}
                  </strong>

                </div>


                <div className="baloz-summary-row">

                  <span>
                    Expected profit
                  </span>

                  <strong className="baloz-summary-profit">
                    {formatInvestmentMoney(
                      allActiveInvestments.reduce(
                        (total, investment) =>
                          total +
                          Number(
                            investment.return_amount ||
                              0
                          ),
                        0
                      )
                    )}
                  </strong>

                </div>


                <div className="baloz-summary-divider" />


                <div className="baloz-summary-row">

                  <span>
                    Active investments
                  </span>

                  <strong>
                    {allActiveInvestments.length}
                  </strong>

                </div>

              </div>

            </aside>

          </section>


          {/* ==================================================
              MARKETS
          ================================================== */}

          <section className="baloz-markets-section">

            <div className="baloz-section-header">

              <div>

                <span className="baloz-overline">
                  MARKET
                </span>

                <h2>
                  Markets
                </h2>

              </div>

            </div>


            <div className="baloz-market-tabs">

              <button
                type="button"
                className={
                  activeMarket === "All"
                    ? "baloz-market-tab-active"
                    : ""
                }
                onClick={() =>
                  setActiveMarket("All")
                }
              >
                All
              </button>


              <button
                type="button"
                className={
                  activeMarket === "Watchlist"
                    ? "baloz-market-tab-active"
                    : ""
                }
                onClick={() =>
                  setActiveMarket(
                    "Watchlist"
                  )
                }
              >
                <Star size={13} />
                Watchlist
              </button>

            </div>


            <div className="baloz-market-table-head">

              <span>
                ASSET
              </span>

              <span>
                PRICE
              </span>

              <span>
                24H CHANGE
              </span>

              <span />

            </div>


            {marketsLoading ? (

              <div className="baloz-market-state">
                Loading live market data...
              </div>

            ) : marketsError ? (

              <div className="baloz-market-state">

                <span>
                  Unable to load market data.
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setMarketsLoading(true);
                    fetchMarkets();
                  }}
                >
                  Try again
                </button>

              </div>

            ) : visibleAssets.length > 0 ? (

              visibleAssets.map((asset) => {

                const meta =
                  getAssetMeta(
                    asset.symbol
                  );

                const isWatching =
                  watchlisted.includes(
                    asset.symbol
                  );


                return (
                  <div
                    className="baloz-market-row"
                    key={asset.id}
                  >

                    <div className="baloz-asset-cell">

                      <button
                        type="button"
                        className="baloz-star-button"
                        onClick={() =>
                          toggleWatchlist(
                            asset.symbol
                          )
                        }
                        aria-label={
                          isWatching
                            ? `Remove ${asset.symbol} from watchlist`
                            : `Add ${asset.symbol} to watchlist`
                        }
                      >
                        <Star
                          size={15}
                          fill={
                            isWatching
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                      <span className="baloz-asset-icon">
                        {meta.icon}
                      </span>

                      <div>

                        <strong>
                          {asset.symbol}
                        </strong>

                        <small>
                          {asset.name}
                        </small>

                      </div>

                    </div>


                    <span className="baloz-price">
                      {formatPrice(
                        asset.price
                      )}
                    </span>


                    <span
                      className={
                        Number(
                          asset.change_24h
                        ) >= 0
                          ? "baloz-change-positive"
                          : "baloz-change-negative"
                      }
                    >
                      {formatPercentage(
                        asset.change_24h
                      )}
                    </span>

                  </div>
                );

              })

            ) : (

              <div className="baloz-no-watchlist">

                <Star size={18} />

                <span>
                  Your watchlist is empty.
                </span>

              </div>

            )}

          </section>


          {/* ==================================================
              LOWER GRID
          ================================================== */}

          <section className="baloz-lower-grid">


            <div className="baloz-lower-panel">

              <div className="baloz-section-header">

                <div>

                  <span className="baloz-overline">
                    HOLDINGS
                  </span>

                  <h2>
                    Your assets
                  </h2>

                </div>

              </div>


              <div className="baloz-holdings-empty">

                <div className="baloz-empty-icon">
                  <Wallet size={20} />
                </div>

                <strong>
                  No assets yet
                </strong>

                <span>
                  Your crypto and cash balances
                  will appear here.
                </span>

              </div>

            </div>


            <div className="baloz-lower-panel">

              <div className="baloz-section-header">

                <div>

                  <span className="baloz-overline">
                    ACTIVITY
                  </span>

                  <h2>
                    Recent activity
                  </h2>

                </div>


                <Link
                  to="/transactions"
                  className="baloz-section-link"
                >
                  History
                  <ChevronRight size={15} />
                </Link>

              </div>


              <div className="baloz-holdings-empty">

                <div className="baloz-empty-icon">
                  <Activity size={20} />
                </div>

                <strong>
                  Nothing here yet
                </strong>

                <span>
                  Your deposits, withdrawals and
                  investments will appear here.
                </span>

              </div>

            </div>

          </section>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <footer className="baloz-dashboard-footer">

            <span>
              Baloz
            </span>

            <span>
              Financial platform
            </span>

            <span>
              © {new Date().getFullYear()}
            </span>

          </footer>


        </main>

      </div>

    </div>
  );
}