from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, RegisterView

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]