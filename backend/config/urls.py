from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/users/",
        include("users.urls"),
    ),

    path(
        "api/investments/",
        include("investments.urls"),
    ),

    path(
        "api/wallet/",
        include("wallets.urls"),
    ),

    path(
        "api/transactions/",
        include("transactions.urls"),
    ),

    path(
        "api/payments/",
        include("payments.urls"),
    ),

    path(
        "api/markets/",
        include("markets.urls"),
    ),

    path(
        "api/admin-dashboard/",
        include("admin_dashboard.urls"),
    ),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )