from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'price', 'quantity', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'street', 'city', 'country', 'total', 'items', 'created_at']
        read_only_fields = ['id', 'status', 'total', 'created_at']


class CheckoutSerializer(serializers.Serializer):
    street  = serializers.CharField(max_length=255)
    city    = serializers.CharField(max_length=100)
    country = serializers.CharField(max_length=100)