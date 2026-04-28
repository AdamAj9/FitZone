from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AdminDashboardView, AdminUserViewSet, AuditLogViewSet

router = DefaultRouter()
router.register("admin/users", AdminUserViewSet, basename="admin-users")
router.register("admin/logs", AuditLogViewSet, basename="admin-logs")

urlpatterns = router.urls + [
    path(
        "admin/dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
    ),
]
