from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'units', UnitViewSet)
router.register(r'products', ProductViewSet)
router.register(r'order-statuses', OrderStatusViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)
router.register(r'carts', CartViewSet)
router.register(r'payment-methods', PaymentMethodViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'delivery-statuses', DeliveryStatusViewSet)
router.register(r'deliveries', DeliveryViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('products/', ProductView.as_view(), name='products'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:pk>/reviews/', ReviewListView.as_view(), name='product-reviews'),
    path('cart/', CartView.as_view(), name='get-cart'),
    path('cart/add/', CartView.as_view(), name='add-to-cart'),
    path('cart/delete/<int:pk>/', CartView.as_view(), name='cart-product-delete'),
    path('cart/quantity/<int:pk>/', CartView.as_view()),
    path('payment-methods/', PaymentMethodsView.as_view()),
    path('orders/create/', OrderView.as_view()),
    path('orders/', OrderView.as_view()),
    path('orders/update_status/<int:pk>/', OrderStatusView.as_view()),
    path('deliveries/', DeliveryView.as_view(), name='get_deliveries'),
    path('orders/refund/<int:pk>/', RefundOrderView.as_view(), name='refund-order'),
    path("profile/change-email/", ChangeEmailView.as_view(), name="change-email"),
    path("profile/change-password/", ChangePasswordView.as_view(), name="change-password"),
]
