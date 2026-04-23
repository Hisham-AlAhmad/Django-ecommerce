from rest_framework.exceptions import ValidationError
from .models import Order, OrderItem
from cart.models import Cart


def place_order(user, street, city, country):
    try:
        cart = Cart.objects.prefetch_related('items__product').get(user=user)
    except Cart.DoesNotExist:
        raise ValidationError('No cart found.')

    if not cart.items.exists():
        raise ValidationError('Your cart is empty.')

    # Validate stock for every item before touching anything
    for item in cart.items.all():
        if item.product.stock < item.quantity:
            raise ValidationError(
                f'Not enough stock for "{item.product.name}". '
                f'Only {item.product.stock} left.'
            )

    # Create the order
    order = Order.objects.create(
        user    = user,
        street  = street,
        city    = city,
        country = country,
        total   = cart.total_price,
    )

    # Snapshot each item and deduct stock
    for item in cart.items.all():
        OrderItem.objects.create(
            order        = order,
            product      = item.product,
            product_name = item.product.name,
            price        = item.product.price,
            quantity     = item.quantity,
        )
        item.product.stock -= item.quantity
        item.product.save()

    # Clear the cart
    cart.items.all().delete()

    return order