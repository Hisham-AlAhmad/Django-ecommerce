from rest_framework.exceptions import ValidationError
from .models import Cart, CartItem
from products.models import Product


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def add_to_cart(user, product_id, quantity):
    if quantity < 1:
        raise ValidationError('Quantity must be at least 1.')

    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        raise ValidationError('Product not found.')

    if product.stock < quantity:
        raise ValidationError(f'Only {product.stock} units available.')

    cart = get_or_create_cart(user)

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )

    if not created:
        new_quantity = cart_item.quantity + quantity
        if new_quantity > product.stock:
            raise ValidationError(f'Only {product.stock} units available.')
        cart_item.quantity = new_quantity
        cart_item.save()

    return cart


def update_cart_item(user, item_id, quantity):
    if quantity < 1:
        raise ValidationError('Quantity must be at least 1.')

    try:
        cart_item = CartItem.objects.select_related('product').get(
            id=item_id,
            cart__user=user
        )
    except CartItem.DoesNotExist:
        raise ValidationError('Cart item not found.')

    if quantity > cart_item.product.stock:
        raise ValidationError(f'Only {cart_item.product.stock} units available.')

    cart_item.quantity = quantity
    cart_item.save()
    return cart_item.cart


def remove_from_cart(user, item_id):
    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=user)
    except CartItem.DoesNotExist:
        raise ValidationError('Cart item not found.')

    cart_item.delete()