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
  Landmark,
  X,
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

const sampleActivities = [
  {
    id: 1,
    name: "Daniel M.",
    type: "investment",
    amount: 12500,
    time: "1 min ago",
  },
  {
    id: 2,
    name: "Sarah K.",
    type: "withdrawal",
    amount: 1850,
    time: "2 mins ago",
  },
  {
    id: 3,
    name: "Michael A.",
    type: "investment",
    amount: 8500,
    time: "3 mins ago",
  },
  {
    id: 4,
    name: "James R.",
    type: "investment",
    amount: 22000,
    time: "4 mins ago",
  },
  {
    id: 5,
    name: "Emily W.",
    type: "withdrawal",
    amount: 3200,
    time: "5 mins ago",
  },
  {
    id: 6,
    name: "Christopher B.",
    type: "investment",
    amount: 6750,
    time: "6 mins ago",
  },
  {
    id: 7,
    name: "Olivia T.",
    type: "investment",
    amount: 15000,
    time: "7 mins ago",
  },
  {
    id: 8,
    name: "Matthew J.",
    type: "withdrawal",
    amount: 750,
    time: "8 mins ago",
  },
  {
    id: 9,
    name: "Andrew P.",
    type: "investment",
    amount: 9800,
    time: "9 mins ago",
  },
  {
    id: 10,
    name: "Sophia L.",
    type: "investment",
    amount: 28500,
    time: "10 mins ago",
  },
  {
    id: 11,
    name: "David H.",
    type: "withdrawal",
    amount: 2400,
    time: "11 mins ago",
  },
  {
    id: 12,
    name: "Jessica R.",
    type: "investment",
    amount: 7200,
    time: "12 mins ago",
  },
  {
    id: 13,
    name: "William C.",
    type: "investment",
    amount: 11250,
    time: "13 mins ago",
  },
  {
    id: 14,
    name: "Ashley N.",
    type: "withdrawal",
    amount: 950,
    time: "14 mins ago",
  },
  {
    id: 15,
    name: "Joshua D.",
    type: "investment",
    amount: 18500,
    time: "15 mins ago",
  },
  {
    id: 16,
    name: "Megan S.",
    type: "investment",
    amount: 5400,
    time: "16 mins ago",
  },
  {
    id: 17,
    name: "Ryan F.",
    type: "withdrawal",
    amount: 4100,
    time: "17 mins ago",
  },
  {
    id: 18,
    name: "Lauren G.",
    type: "investment",
    amount: 13200,
    time: "18 mins ago",
  },
  {
    id: 19,
    name: "Jonathan E.",
    type: "investment",
    amount: 35000,
    time: "19 mins ago",
  },
  {
    id: 20,
    name: "Amanda V.",
    type: "withdrawal",
    amount: 1600,
    time: "20 mins ago",
  },
  {
    id: 21,
    name: "Nicholas P.",
    type: "investment",
    amount: 9100,
    time: "21 mins ago",
  },
  {
    id: 22,
    name: "Grace B.",
    type: "investment",
    amount: 14750,
    time: "22 mins ago",
  },
  {
    id: 23,
    name: "Brandon W.",
    type: "withdrawal",
    amount: 2750,
    time: "23 mins ago",
  },
  {
    id: 24,
    name: "Hannah M.",
    type: "investment",
    amount: 6250,
    time: "24 mins ago",
  },
  {
    id: 25,
    name: "Kevin T.",
    type: "investment",
    amount: 24500,
    time: "25 mins ago",
  },
  {
    id: 26,
    name: "Rachel A.",
    type: "withdrawal",
    amount: 5200,
    time: "26 mins ago",
  },
  {
    id: 27,
    name: "Ethan S.",
    type: "investment",
    amount: 11800,
    time: "27 mins ago",
  },
  {
    id: 28,
    name: "Madison J.",
    type: "investment",
    amount: 7600,
    time: "28 mins ago",
  },
  {
    id: 29,
    name: "Tyler K.",
    type: "withdrawal",
    amount: 1250,
    time: "29 mins ago",
  },
  {
    id: 30,
    name: "Victoria C.",
    type: "investment",
    amount: 19500,
    time: "30 mins ago",
  },
  {
    id: 31,
    name: "Nathan R.",
    type: "investment",
    amount: 8300,
    time: "31 mins ago",
  },
  {
    id: 32,
    name: "Chloe H.",
    type: "withdrawal",
    amount: 3600,
    time: "32 mins ago",
  },
  {
    id: 33,
    name: "Alexander W.",
    type: "investment",
    amount: 27500,
    time: "33 mins ago",
  },
  {
    id: 34,
    name: "Samantha D.",
    type: "investment",
    amount: 10400,
    time: "34 mins ago",
  },
  {
    id: 35,
    name: "Benjamin L.",
    type: "withdrawal",
    amount: 680,
    time: "35 mins ago",
  },
  {
    id: 36,
    name: "Natalie P.",
    type: "investment",
    amount: 6900,
    time: "36 mins ago",
  },
  {
    id: 37,
    name: "Jason F.",
    type: "investment",
    amount: 16000,
    time: "37 mins ago",
  },
  {
    id: 38,
    name: "Elizabeth G.",
    type: "withdrawal",
    amount: 2950,
    time: "38 mins ago",
  },
  {
    id: 39,
    name: "Jacob N.",
    type: "investment",
    amount: 12500,
    time: "39 mins ago",
  },
  {
    id: 40,
    name: "Kayla V.",
    type: "investment",
    amount: 42000,
    time: "40 mins ago",
  },
  {
    id: 41,
    name: "Marcus J.",
    type: "withdrawal",
    amount: 2100,
    time: "41 mins ago",
  },
  {
    id: 42,
    name: "Taylor B.",
    type: "investment",
    amount: 8700,
    time: "42 mins ago",
  },
  {
    id: 43,
    name: "Anthony C.",
    type: "investment",
    amount: 14800,
    time: "43 mins ago",
  },
  {
    id: 44,
    name: "Brittany S.",
    type: "withdrawal",
    amount: 4800,
    time: "44 mins ago",
  },
  {
    id: 45,
    name: "Justin H.",
    type: "investment",
    amount: 21500,
    time: "45 mins ago",
  },
  {
    id: 46,
    name: "Nicole F.",
    type: "investment",
    amount: 5900,
    time: "46 mins ago",
  },
  {
    id: 47,
    name: "Robert D.",
    type: "withdrawal",
    amount: 1450,
    time: "47 mins ago",
  },
  {
    id: 48,
    name: "Stephanie M.",
    type: "investment",
    amount: 9300,
    time: "48 mins ago",
  },
  {
    id: 49,
    name: "Brandon K.",
    type: "investment",
    amount: 31500,
    time: "49 mins ago",
  },
  {
    id: 50,
    name: "Lauren P.",
    type: "withdrawal",
    amount: 3300,
    time: "50 mins ago",
  },
  {
    id: 51,
    name: "Eric T.",
    type: "investment",
    amount: 11750,
    time: "51 mins ago",
  },
  {
    id: 52,
    name: "Mia R.",
    type: "investment",
    amount: 7800,
    time: "52 mins ago",
  },
  {
    id: 53,
    name: "Brian W.",
    type: "withdrawal",
    amount: 2250,
    time: "53 mins ago",
  },
  {
    id: 54,
    name: "Kayla S.",
    type: "investment",
    amount: 17200,
    time: "54 mins ago",
  },
  {
    id: 55,
    name: "Steven A.",
    type: "investment",
    amount: 26500,
    time: "55 mins ago",
  },
  {
    id: 56,
    name: "Alyssa C.",
    type: "withdrawal",
    amount: 890,
    time: "56 mins ago",
  },
  {
    id: 57,
    name: "Kevin M.",
    type: "investment",
    amount: 6400,
    time: "57 mins ago",
  },
  {
    id: 58,
    name: "Thomas J.",
    type: "investment",
    amount: 13800,
    time: "58 mins ago",
  },
  {
    id: 59,
    name: "Rebecca L.",
    type: "withdrawal",
    amount: 3750,
    time: "59 mins ago",
  },
  {
    id: 60,
    name: "Charles B.",
    type: "investment",
    amount: 23000,
    time: "1 hour ago",
  },
  {
    id: 61,
    name: "Isabella M.",
    type: "investment",
    amount: 8500,
    time: "1 hour ago",
  },
  {
    id: 62,
    name: "Patrick O.",
    type: "withdrawal",
    amount: 1950,
    time: "1 hour ago",
  },
  {
    id: 63,
    name: "Kayla N.",
    type: "investment",
    amount: 15600,
    time: "1 hour ago",
  },
  {
    id: 64,
    name: "Jordan E.",
    type: "investment",
    amount: 32500,
    time: "1 hour ago",
  },
  {
    id: 65,
    name: "Cameron R.",
    type: "withdrawal",
    amount: 4200,
    time: "1 hour ago",
  },
  {
    id: 66,
    name: "Morgan T.",
    type: "investment",
    amount: 7100,
    time: "1 hour ago",
  },
  {
    id: 67,
    name: "Derek P.",
    type: "investment",
    amount: 19800,
    time: "1 hour ago",
  },
  {
    id: 68,
    name: "Liam H.",
    type: "withdrawal",
    amount: 1150,
    time: "1 hour ago",
  },
  {
    id: 69,
    name: "Abigail W.",
    type: "investment",
    amount: 9200,
    time: "1 hour ago",
  },
  {
    id: 70,
    name: "Sean D.",
    type: "investment",
    amount: 45000,
    time: "1 hour ago",
  },
  {
    id: 71,
    name: "Zoe F.",
    type: "withdrawal",
    amount: 2850,
    time: "1 hour ago",
  },
  {
    id: 72,
    name: "Nathaniel K.",
    type: "investment",
    amount: 13400,
    time: "1 hour ago",
  },
  {
    id: 73,
    name: "George V.",
    type: "investment",
    amount: 6800,
    time: "1 hour ago",
  },
  {
    id: 74,
    name: "Emma J.",
    type: "withdrawal",
    amount: 5100,
    time: "1 hour ago",
  },
  {
    id: 75,
    name: "Lucas A.",
    type: "investment",
    amount: 18200,
    time: "1 hour ago",
  },
  {
    id: 76,
    name: "Henry S.",
    type: "investment",
    amount: 29500,
    time: "1 hour ago",
  },
  {
    id: 77,
    name: "Amelia R.",
    type: "withdrawal",
    amount: 1750,
    time: "1 hour ago",
  },
  {
    id: 78,
    name: "Samuel C.",
    type: "investment",
    amount: 10900,
    time: "1 hour ago",
  },
  {
    id: 79,
    name: "Charlotte P.",
    type: "investment",
    amount: 7500,
    time: "1 hour ago",
  },
  {
    id: 80,
    name: "Daniel O.",
    type: "withdrawal",
    amount: 3400,
    time: "1 hour ago",
  },
  {
    id: 81,
    name: "Noah G.",
    type: "investment",
    amount: 14200,
    time: "1 hour ago",
  },
  {
    id: 82,
    name: "Ethan B.",
    type: "investment",
    amount: 21500,
    time: "1 hour ago",
  },
  {
    id: 83,
    name: "Harper L.",
    type: "withdrawal",
    amount: 950,
    time: "1 hour ago",
  },
  {
    id: 84,
    name: "Mason T.",
    type: "investment",
    amount: 8700,
    time: "1 hour ago",
  },
  {
    id: 85,
    name: "Ella M.",
    type: "investment",
    amount: 37500,
    time: "1 hour ago",
  },
  {
    id: 86,
    name: "Oliver R.",
    type: "withdrawal",
    amount: 2600,
    time: "1 hour ago",
  },
  {
    id: 87,
    name: "Grace W.",
    type: "investment",
    amount: 11900,
    time: "1 hour ago",
  },
  {
    id: 88,
    name: "Aiden K.",
    type: "investment",
    amount: 6200,
    time: "1 hour ago",
  },
  {
    id: 89,
    name: "Sophia M.",
    type: "withdrawal",
    amount: 3900,
    time: "1 hour ago",
  },
  {
    id: 90,
    name: "Marcus L.",
    type: "investment",
    amount: 25500,
    time: "1 hour ago",
  },
  {
    id: 91,
    name: "Hannah C.",
    type: "investment",
    amount: 9600,
    time: "1 hour ago",
  },
  {
    id: 92,
    name: "Ryan J.",
    type: "withdrawal",
    amount: 1350,
    time: "1 hour ago",
  },
  {
    id: 93,
    name: "Lily B.",
    type: "investment",
    amount: 16500,
    time: "1 hour ago",
  },
  {
    id: 94,
    name: "Alex P.",
    type: "investment",
    amount: 28500,
    time: "1 hour ago",
  },
  {
    id: 95,
    name: "Mason H.",
    type: "withdrawal",
    amount: 4700,
    time: "1 hour ago",
  },
  {
    id: 96,
    name: "Anna K.",
    type: "investment",
    amount: 7300,
    time: "1 hour ago",
  },
  {
    id: 97,
    name: "Marcus T.",
    type: "investment",
    amount: 19500,
    time: "1 hour ago",
  },
  {
    id: 98,
    name: "Sophie R.",
    type: "withdrawal",
    amount: 2200,
    time: "1 hour ago",
  },
  {
    id: 99,
    name: "Jason M.",
    type: "investment",
    amount: 34500,
    time: "1 hour ago",
  },
  {
    id: 100,
    name: "William P.",
    type: "investment",
    amount: 12800,
    time: "1 hour ago",
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

  const [sampleActivityIndex, setSampleActivityIndex] =
    useState(0);

  const [sampleActivityVisible, setSampleActivityVisible] =
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

  const [notifications, setNotifications] =
    useState([]);

  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [notificationsError, setNotificationsError] =
    useState(false);

  const [selectedNotification, setSelectedNotification] =
    useState(null);


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

    const fetchUnreadNotificationCount = async () => {
    try {
      const response = await api.get(
        "/notifications/unread-count/"
      );

      setUnreadNotificationCount(
        Number(
          response.data?.unread_count || 0
        )
      );
    } catch (error) {
      console.error(
        "Failed to load notification count:",
        error
      );
    }
  };


  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setNotificationsError(false);

      const response = await api.get(
        "/notifications/"
      );

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : response.data?.results || [];

      setNotifications(data);

      await fetchUnreadNotificationCount();
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setNotificationsError(true);
    } finally {
      setNotificationsLoading(false);
    }
  };


  const handleOpenNotifications = async () => {
    const nextState =
      !notificationsOpen;

    setNotificationsOpen(nextState);

    if (nextState) {
      await fetchNotifications();
    }
  };


  const handleOpenNotification = async (
    notification
  ) => {
    setSelectedNotification(notification);
    setNotificationsOpen(false);

    if (notification.is_read) {
      return;
    }

    if (notification.is_read) {
      return;
    }

    try {
      await api.post(
        `/notifications/${notification.id}/read/`
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
                read_at:
                  new Date().toISOString(),
              }
            : item
        )
      );

      setUnreadNotificationCount(
        (current) =>
          Math.max(0, current - 1)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };


  const handleMarkAllNotificationsRead =
    async () => {
      if (
        unreadNotificationCount === 0
      ) {
        return;
      }

      try {
        await api.post(
          "/notifications/read-all/"
        );

        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            is_read: true,
            read_at:
              notification.read_at ||
              new Date().toISOString(),
          }))
        );

        setUnreadNotificationCount(0);
      } catch (error) {
        console.error(
          "Failed to mark notifications as read:",
          error
        );
      }
    };


  const closeNotificationModal = () => {
    setSelectedNotification(null);
  };


    useEffect(() => {
      fetchMarkets();
      fetchWallet();
      fetchUser();
      fetchInvestments();
      fetchUnreadNotificationCount();

      const interval = setInterval(() => {
        fetchMarkets();
        fetchWallet();
        fetchInvestments();
        fetchUnreadNotificationCount();
      }, 60000);

      return () => {
        clearInterval(interval);
      };
    }, []);

  useEffect(() => {
    const activityInterval = setInterval(() => {
      setSampleActivityVisible(false);

      setTimeout(() => {
        setSampleActivityIndex((current) => {
          return (
            (current + 1) %
            sampleActivities.length
          );
        });

        setSampleActivityVisible(true);
      }, 300);
    }, 5000);

    return () => {
      clearInterval(activityInterval);
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


  const formatDisplayName = (name) => {
    if (!name) {
      return "there";
    }

    return name
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const displayName = formatDisplayName(
    user?.first_name ||
    user?.email?.split("@")[0]
  );


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
              H
            </span>

            <span className="baloz-brand-name">
              HarvestCoin
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

          <Link
            to="/loans"
            className="baloz-sidebar-link"
          >
            <Landmark size={17} />
            <span>Loans</span>
          </Link>

        </div>


        <div className="baloz-sidebar-section">

          <span className="baloz-sidebar-title">
            ACCOUNT
          </span>


          <button
            type="button"
            className="baloz-sidebar-link baloz-sidebar-notification-link"
            onClick={handleOpenNotifications}
          >
            <Bell size={17} />

            <span>
              Notifications
            </span>

            {unreadNotificationCount > 0 && (
              <span className="baloz-sidebar-notification-count">
                {unreadNotificationCount > 99
                  ? "99+"
                  : unreadNotificationCount}
              </span>
            )}
          </button>


          <Link
            to="/settings"
            className="baloz-sidebar-link"
          >
            <Settings size={17} />

            <span>
              Settings
            </span>
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
            HarvestCoin Financial Platform
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
                HarvestCoin
              </Link>


            </nav>

          </div>


          <div className="baloz-topbar-right">

            <div className="baloz-notification-wrapper">

              <button
                type="button"
                className={`baloz-notification-button ${
                  notificationsOpen
                    ? "baloz-notification-button-active"
                    : ""
                }`}
                onClick={handleOpenNotifications}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell size={18} />

                {unreadNotificationCount > 0 && (
                  <span className="baloz-notification-count">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>


              {notificationsOpen && (
                <div className="baloz-notification-panel">

                  <div className="baloz-notification-panel-header">

                    <div>
                      <span className="baloz-notification-panel-overline">
                        ACCOUNT
                      </span>

                      <h3>
                        Notifications
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="baloz-notification-close"
                      onClick={() =>
                        setNotificationsOpen(false)
                      }
                      aria-label="Close notifications"
                    >
                      <X size={17} />
                    </button>

                  </div>


                  <div className="baloz-notification-panel-actions">

                    <span>
                      {unreadNotificationCount} unread
                    </span>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllNotificationsRead
                        }
                      >
                        Mark all as read
                      </button>
                    )}

                  </div>


                  <div className="baloz-notification-list">

                    {notificationsLoading ? (

                      <div className="baloz-notification-state">
                        <RefreshCw
                          size={17}
                          className="baloz-notification-spin"
                        />

                        <span>
                          Loading notifications...
                        </span>
                      </div>

                    ) : notificationsError ? (

                      <div className="baloz-notification-state">

                        <span>
                          Unable to load notifications.
                        </span>

                        <button
                          type="button"
                          onClick={fetchNotifications}
                        >
                          Try again
                        </button>

                      </div>

                    ) : notifications.length === 0 ? (

                      <div className="baloz-notification-empty">

                        <div className="baloz-notification-empty-icon">
                          <Bell size={18} />
                        </div>

                        <strong>
                          No notifications
                        </strong>

                        <span>
                          You’re all caught up.
                        </span>

                      </div>

                    ) : (

                      notifications.map(
                        (notification) => (
                          <button
                            type="button"
                            key={notification.id}
                            className={`baloz-notification-item ${
                              notification.is_read
                                ? "baloz-notification-item-read"
                                : "baloz-notification-item-unread"
                            }`}
                            onClick={() =>
                              handleOpenNotification(
                                notification
                              )
                            }
                          >

                            <div className="baloz-notification-item-icon">
                              <Bell size={16} />
                            </div>


                            <div className="baloz-notification-item-content">

                              <div className="baloz-notification-item-heading">

                                <strong>
                                  {notification.title}
                                </strong>

                                {!notification.is_read && (
                                  <span className="baloz-notification-unread-dot" />
                                )}

                              </div>


                              <p>
                                {notification.message}
                              </p>


                              <span className="baloz-notification-item-time">
                                {new Date(
                                  notification.created_at
                                ).toLocaleString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>

                            </div>

                            <ChevronRight
                              size={15}
                              className="baloz-notification-item-arrow"
                            />

                          </button>
                        )
                      )

                    )}

                  </div>

                </div>
              )}

            </div>


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
          <div
            className={`baloz-floating-activity ${
              sampleActivityVisible
                ? "baloz-floating-activity-visible"
                : "baloz-floating-activity-hidden"
            }`}
            key={sampleActivities[sampleActivityIndex].id}
          >
            <div className="baloz-floating-activity-header">
              <div className="baloz-floating-activity-label">
                <span className="baloz-floating-activity-live" />
                <span>Recent Activity</span>
              </div>

              <button
                type="button"
                className="baloz-floating-activity-close"
                onClick={() =>
                  setSampleActivityVisible(false)
                }
                aria-label="Dismiss activity notification"
              >
                ×
              </button>
            </div>

            <div className="baloz-floating-activity-body">
              <div
                className={
                  sampleActivities[
                    sampleActivityIndex
                  ].type === "investment"
                    ? "baloz-floating-activity-icon baloz-floating-activity-investment"
                    : "baloz-floating-activity-icon baloz-floating-activity-withdrawal"
                }
              >
                {sampleActivities[
                  sampleActivityIndex
                ].type === "investment" ? (
                  <TrendingUp size={17} />
                ) : (
                  <ArrowUpFromLine size={17} />
                )}
              </div>

              <div className="baloz-floating-activity-content">
                <div className="baloz-floating-activity-message">
                  <strong>
                    {sampleActivities[
                      sampleActivityIndex
                    ].name}
                  </strong>

                  <span>
                    {sampleActivities[
                      sampleActivityIndex
                    ].type === "investment"
                      ? " just invested "
                      : " just withdrew "}
                  </span>

                  <strong>
                    $
                    {Number(
                      sampleActivities[
                        sampleActivityIndex
                      ].amount
                    ).toLocaleString("en-US")}
                  </strong>

                  {sampleActivities[
                    sampleActivityIndex
                  ].type === "investment" && (
                    <span>
                      {" "}in HarvestCoin
                    </span>
                  )}
                </div>

                <span className="baloz-floating-activity-time">
                  {sampleActivities[
                    sampleActivityIndex
                  ].time}
                </span>
              </div>
            </div>

            <div className="baloz-floating-activity-footer">
              Recent Activity
            </div>
          </div>
          


          {/* ==================================================
              FOOTER
          ================================================== */}

          <footer className="baloz-dashboard-footer">

            <span>
              HarvestCoin
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


      {/* ==================================================
          NOTIFICATION MESSAGE MODAL
      ================================================== */}

      {selectedNotification && (
        <div
          className="baloz-notification-modal-backdrop"
          onClick={closeNotificationModal}
        >

          <div
            className="baloz-notification-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="baloz-notification-modal-header">

              <div className="baloz-notification-modal-icon">
                <Bell size={18} />
              </div>

              <button
                type="button"
                className="baloz-notification-modal-close"
                onClick={
                  closeNotificationModal
                }
                aria-label="Close notification"
              >
                <X size={17} />
              </button>

            </div>


            <div className="baloz-notification-modal-body">

              <span className="baloz-notification-modal-label">
                {selectedNotification.notification_type ===
                "admin_message"
                  ? "HARVESTCOIN MESSAGE"
                  : "NOTIFICATION"}
              </span>

              <h2>
                {selectedNotification.title}
              </h2>

              <p>
                {selectedNotification.message}
              </p>

              <span className="baloz-notification-modal-time">
                {new Date(
                  selectedNotification.created_at
                ).toLocaleString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }
                )}
              </span>

            </div>

          </div>

        </div>
      )}


    </div>
  );
}