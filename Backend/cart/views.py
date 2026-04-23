from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import CartSerializer
from .services import get_or_create_cart, add_to_cart, update_cart_item, remove_from_cart


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity   = request.data.get('quantity', 1)
        cart = add_to_cart(request.user, product_id, quantity)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        quantity = request.data.get('quantity')
        cart = update_cart_item(request.user, item_id, quantity)
        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        remove_from_cart(request.user, item_id)
        return Response(status=status.HTTP_204_NO_CONTENT)