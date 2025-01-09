from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import (
    Category, Unit, Product, OrderStatus, Order, OrderItem, Cart,
    CartItem, PaymentMethod, Payment, DeliveryStatus, Delivery, Review
)
from .serializers import *

# ===== ViewSets для CRUD операций =====

class CategoryViewSet(viewsets.ModelViewSet):
    """
    Управление категориями товаров
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class UnitViewSet(viewsets.ModelViewSet):
    """
    Управление единицами измерения товаров
    """
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    Управление товарами
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class OrderStatusViewSet(viewsets.ModelViewSet):
    """
    Управление статусами заказов
    """
    queryset = OrderStatus.objects.all()
    serializer_class = OrderStatusSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """
    Управление заказами
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class OrderItemViewSet(viewsets.ModelViewSet):
    """
    Управление заказами
    """
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer

class OrderItemViewSet(viewsets.ModelViewSet):
    """
    Управление элементами заказов
    """
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer


class CartViewSet(viewsets.ModelViewSet):
    """
    Управление корзиной
    """
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

class CartItemViewSet(viewsets.ModelViewSet):
    """
    Управление корзиной
    """
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """
    Управление методами оплаты
    """
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    """
    Управление платежами
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer


class DeliveryStatusViewSet(viewsets.ModelViewSet):
    """
    Управление статусами доставки
    """
    queryset = DeliveryStatus.objects.all()
    serializer_class = DeliveryStatusSerializer


class DeliveryViewSet(viewsets.ModelViewSet):
    """
    Управление доставкой
    """
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """
    Управление отзывами
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ProductView(APIView):
    """
    Получение профиля текущего пользователя.
    """
    def get(self, request):
        serializer = ProductSerializer(Product.objects.all(), many=True)
        return Response(serializer.data)

class UserProfileView(APIView):
    """
    Получение профиля текущего пользователя.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)


class UserRegistrationView(APIView):
    """
    Регистрация нового пользователя.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Проверка обязательных полей
        if not username or not password:
            return Response({"error": "Все поля обязательны."}, status=400)

        # Проверка существующего пользователя
        if User.objects.filter(username=username).exists():
            return Response({"error": "Имя пользователя уже занято."}, status=400)

        # Создание нового пользователя
        user = User.objects.create_user(username=username, email=username, password=password)
        return Response({"message": "Пользователь успешно создан.", "username": user.username})

class ProductDetailView(APIView):
    def get(self, request, pk):
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

class ReviewListView(APIView):
    def get(self, request, pk):
        reviews = Review.objects.filter(product_id=pk)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        data = request.data
        data['product'] = pk
        data['user'] = request.user.id
        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
class CartView(APIView):
    def get(self, request):
        """
        Получение корзины текущего пользователя с вложенными элементами корзины.
        """
        if not request.user.is_authenticated:
            return Response({"error": "Пользователь не аутентифицирован."}, status=status.HTTP_401_UNAUTHORIZED)

        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return Response({"message": "Корзина пуста."}, status=status.HTTP_200_OK)

        cart_items = CartItem.objects.filter(cart=cart).select_related('product')

        # Формируем ответ с вложенными данными
        result = []
        for item in cart_items:
            result.append({
                "id": item.id,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "price": item.product.price
                },
                "quantity": item.quantity,
                "subtotal": item.subtotal()  # Вычисляем сумму за конкретный элемент
            })

        return Response({
            "cart_id": cart.id,
            "items": result,
            "total": sum(item.subtotal() for item in cart_items)  # Общая сумма корзины
        }, status=status.HTTP_200_OK)


    """
    Добавление товара в корзину или обновление его количества.
    """
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        if not product_id or int(quantity) <= 0:
            return Response({"error": "ID продукта и положительное количество обязательны."}, status=400)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Продукт не найден."}, status=404)

        cart, created = Cart.objects.get_or_create(user=user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += int(quantity)
        else:
            cart_item.quantity = int(quantity)
        cart_item.save()

        return Response({"message": "Товар успешно добавлен в корзину."}, status=200)

    def delete(self, request, pk):
        try:
            cart_item = CartItem.objects.get(pk=pk, cart__user=request.user)
            cart_item.delete()
            return Response({"message": "Товар удален из корзины."})
        except Cart.DoesNotExist:
            return Response({"error": "Элемент корзины не найден."}, status=404)

    def put(self, request, pk):
        """
        Обновление количества товара в элементе корзины.
        """
        user = request.user
        try:
            cart_item = CartItem.objects.get(pk=pk, cart__user=user)  # Находим элемент корзины пользователя
            quantity = request.data.get('quantity')
            if not quantity or int(quantity) <= 0:
                return Response({"error": "Количество должно быть больше нуля."}, status=400)

            cart_item.quantity = int(quantity)
            cart_item.save()
            return Response({"message": "Количество обновлено", "item": {
                "id": cart_item.id,
                "product": {
                    "id": cart_item.product.id,
                    "name": cart_item.product.name,
                },
                "quantity": cart_item.quantity,
                "subtotal": cart_item.subtotal(),
            }})
        except CartItem.DoesNotExist:
            return Response({"error": "Элемент корзины не найден."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class PaymentMethodsView(APIView):
    def get(self, request):
        payment_methods = PaymentMethod.objects.all()
        serializer = PaymentMethodSerializer(payment_methods, many=True)
        return Response(serializer.data)

class DeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Получение списка доставок текущего пользователя.
        """
        orders = Order.objects.filter(user=request.user)
        deliveries = []
        for order in orders:
            deliveries.append(Delivery.objects.filter(order=order).first())
        
        # Формируем ответ с вложенными данными
        print(deliveries)
        result = []
        for delivery in deliveries:
            result.append({
                "id": delivery.id,
                "order": {
                    "id": delivery.order.id,
                    "total_amount": delivery.order.total_amount,
                },
                "delivery_status": {
                    "id": delivery.delivery_status.id,
                    "status": delivery.delivery_status.status,
                },
                "delivery_address": delivery.delivery_address,
                "delivered_at": delivery.delivered_at,
            })

        return Response(result, status=200)

class OrderStatusView(APIView):
    def put(self, request, pk):
        user = request.user
        order = Order.objects.get(pk=pk, user=user)

        if order.order_status == "Paid":
            return Response({"error": "Заказ уже оплачен."}, status=400)

        paid_status = OrderStatus.objects.get(status="Paid")
        order.order_status = paid_status
        order.save()

        return Response({"message": "Заказ успешно оплачен'."}, status=200)

class OrderView(APIView):
    def post(self, request):
        user = request.user
        payment_method_id = request.data.get('payment_method_id')
        address = request.data.get('delivery_address')

        # Проверяем, указал ли пользователь адрес доставки
        if not address:
            return Response({"error": "Адрес доставки обязателен."}, status=400)

        # Создаём заказ
        total_amount = 0
        order = Order.objects.create(
            user=user,
            order_status=OrderStatus.objects.get(status="Not paid"),
            total_amount=0
        )

        # Получаем элементы корзины
        cart = Cart.objects.filter(user=user).first()
        cart_items = CartItem.objects.filter(cart=cart).all()

        if not cart_items.exists():
            return Response({"error": "Корзина пуста."}, status=400)

        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price_at_purchase=cart_item.product.price
            )
            total_amount += cart_item.product.price * cart_item.quantity

        # Сохраняем общую сумму заказа
        order.total_amount = total_amount
        order.save()

        # Создаём запись доставки
        delivery_status = DeliveryStatus.objects.first()  # Статус доставки по умолчанию
        Delivery.objects.create(
            order=order,
            delivery_address=address,
            delivery_status=delivery_status
        )

        # Очищаем корзину
        cart_items.delete()

        return Response({"message": "Заказ и доставка созданы", "order_id": order.id})
    
    def get(self, request):
        """
        Получение списка заказов текущего пользователя с вложенными элементами заказа.
        """
        if not request.user.is_authenticated:
            return Response({"error": "Пользователь не аутентифицирован."}, status=status.HTTP_401_UNAUTHORIZED)

        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        if not orders.exists():
            return Response({"message": "Заказов нет."}, status=status.HTTP_200_OK)

        result = []
        for order in orders:
            order_items = OrderItem.objects.filter(order=order).select_related('product')
            items = [
                {
                    "id": item.id,
                    "product": {"name": item.product.name},
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase
                }
                for item in order_items
            ]
            print(order.order_status)

            result.append({
                "id": order.id,
                "created_at": order.created_at,
                "total_amount": order.total_amount,
                "order_status": str(order.order_status),
                "items": items
            })

        return Response(result, status=status.HTTP_200_OK)

class RefundOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            user = request.user
            order = Order.objects.get(pk=pk, user=user)

            # Проверяем статус заказа
            if order.order_status.status == "Refunded":
                return Response({"error": "Заказ уже возвращен."}, status=status.HTTP_400_BAD_REQUEST)

            refund_status = OrderStatus.objects.get(status="Refunded")
            cancelled_delivery_status = DeliveryStatus.objects.get(status="Cancelled")

            # Обновление статуса заказа
            order.order_status = refund_status
            order.save()

            # Обновление статуса доставки
            delivery = Delivery.objects.get(order=order)
            delivery.delivery_status = cancelled_delivery_status
            delivery.save()

            return Response({"message": "Заказ успешно возвращен."}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"error": "Заказ не найден."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class ChangeEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        new_email = request.data.get("email")
        if not new_email:
            return Response({"error": "Email обязателен."}, status=400)

        user = request.user
        user.email = new_email
        user.username = new_email  # Update username if it matches the email
        user.save()
        return Response({"message": "Email успешно обновлён."}, status=200)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response({"error": "Оба пароля обязательны."}, status=400)

        user = request.user
        if not user.check_password(old_password):
            return Response({"error": "Старый пароль неверный."}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Пароль успешно обновлён."}, status=200)
