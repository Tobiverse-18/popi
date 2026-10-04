from django.urls import path

from .views import (
    AdminUserNotificationCreateView,
    MarkAllNotificationsReadView,
    MarkNotificationReadView,
    NotificationListView,
    UnreadNotificationCountView,
)


urlpatterns = [
    path(
        "",
        NotificationListView.as_view(),
        name="notification-list",
    ),

    path(
        "unread-count/",
        UnreadNotificationCountView.as_view(),
        name="notification-unread-count",
    ),

    path(
        "<int:pk>/read/",
        MarkNotificationReadView.as_view(),
        name="notification-read",
    ),

    path(
        "read-all/",
        MarkAllNotificationsReadView.as_view(),
        name="notification-read-all",
    ),

    path(
        "admin/users/<int:user_id>/messages/",
        AdminUserNotificationCreateView.as_view(),
        name="admin-user-notification-create",
    ),
]