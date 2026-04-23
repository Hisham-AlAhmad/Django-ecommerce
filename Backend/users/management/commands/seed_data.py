from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from cart.models import Cart, CartItem
from contact.models import ContactMessage
from orders.models import Order, OrderItem
from products.models import Category, Product
from users.models import Address


class Command(BaseCommand):
    help = "Seed demo data for local development and staging demos."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing demo domain data before reseeding.",
        )
        parser.add_argument(
            "--password",
            default="DemoPass123!",
            help="Password to set for demo users.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()
        demo_password = options["password"]

        if options["reset"]:
            self.stdout.write(self.style.WARNING("Reset flag detected: clearing existing seedable data..."))

            # Keep migration history and auth tables intact while resetting domain data.
            OrderItem.objects.all().delete()
            Order.objects.all().delete()
            CartItem.objects.all().delete()
            Cart.objects.all().delete()
            ContactMessage.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            Address.objects.all().delete()
            User.objects.filter(email__in=[
                "demo-admin@digitalhub.local",
                "sara.khaled@digitalhub.local",
                "karim.nader@digitalhub.local",
            ]).delete()

        demo_users = {
            "admin": {
                "email": "demo-admin@digitalhub.local",
                "first_name": "Demo",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True,
            },
            "sara": {
                "email": "sara.khaled@digitalhub.local",
                "first_name": "Sara",
                "last_name": "Khaled",
                "is_staff": False,
                "is_superuser": False,
            },
            "karim": {
                "email": "karim.nader@digitalhub.local",
                "first_name": "Karim",
                "last_name": "Nader",
                "is_staff": False,
                "is_superuser": False,
            },
        }

        created_users = {}
        for key, payload in demo_users.items():
            user, created = User.objects.get_or_create(
                email=payload["email"],
                defaults={
                    "first_name": payload["first_name"],
                    "last_name": payload["last_name"],
                    "is_staff": payload["is_staff"],
                    "is_superuser": payload["is_superuser"],
                },
            )

            # BUGFIX: Ensure demo credentials are deterministic across reruns.
            user.first_name = payload["first_name"]
            user.last_name = payload["last_name"]
            user.is_staff = payload["is_staff"]
            user.is_superuser = payload["is_superuser"]
            user.set_password(demo_password)
            user.save()

            created_users[key] = user
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created user: {user.email}"))

        addresses_payload = [
            ("sara", "Rue Verdun 118", "Beirut", "Lebanon", True),
            ("sara", "Ain El Tineh 22", "Beirut", "Lebanon", False),
            ("karim", "Bourj Hammoud 9", "Metn", "Lebanon", True),
        ]

        for user_key, street, city, country, is_default in addresses_payload:
            Address.objects.get_or_create(
                user=created_users[user_key],
                street=street,
                city=city,
                country=country,
                defaults={"is_default": is_default},
            )

        categories_payload = [
            ("Fresh Juices", "fresh-juices"),
            ("Milkshakes", "milkshakes"),
            ("Desserts", "desserts"),
            ("Healthy Snacks", "healthy-snacks"),
        ]

        category_map = {}
        for name, slug in categories_payload:
            category, _ = Category.objects.get_or_create(name=name, slug=slug)
            category_map[slug] = category

        products_payload = [
            ("Orange Blast", "orange-blast", "fresh-juices", "Fresh orange juice with mint.", Decimal("3.50"), 70),
            ("Tropical Mix", "tropical-mix", "fresh-juices", "Mango, pineapple, and passion fruit.", Decimal("4.25"), 55),
            ("Berry Boost", "berry-boost", "fresh-juices", "Strawberry and blueberry energy blend.", Decimal("4.75"), 40),
            ("Vanilla Cloud", "vanilla-cloud", "milkshakes", "Classic vanilla milkshake.", Decimal("5.00"), 35),
            ("Choco Crunch", "choco-crunch", "milkshakes", "Chocolate shake with cocoa nibs.", Decimal("5.50"), 50),
            ("Dates Smoothie", "dates-smoothie", "milkshakes", "Dates, milk, and cinnamon.", Decimal("5.25"), 44),
            ("Cheesecake Jar", "cheesecake-jar", "desserts", "No-bake cheesecake with berry compote.", Decimal("6.50"), 24),
            ("Lotus Dream", "lotus-dream", "desserts", "Lotus biscuit cream cup.", Decimal("6.25"), 29),
            ("Fruit Trifle", "fruit-trifle", "desserts", "Layered fruit cream dessert.", Decimal("6.00"), 31),
            ("Protein Bites", "protein-bites", "healthy-snacks", "Oats, peanut butter, and dates.", Decimal("3.00"), 90),
            ("Granola Cup", "granola-cup", "healthy-snacks", "Yogurt with granola and berries.", Decimal("4.80"), 42),
            ("Avocado Toast", "avocado-toast", "healthy-snacks", "Sourdough toast with avocado and seeds.", Decimal("4.95"), 33),
        ]

        product_map = {}
        for name, slug, category_slug, description, price, stock in products_payload:
            product, _ = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "category": category_map[category_slug],
                    "description": description,
                    "price": price,
                    "stock": stock,
                    "is_active": True,
                },
            )

            product.name = name
            product.category = category_map[category_slug]
            product.description = description
            product.price = price
            product.stock = stock
            product.is_active = True
            product.save()
            product_map[slug] = product

        cart_specs = {
            "sara": [
                ("orange-blast", 2),
                ("lotus-dream", 1),
            ],
            "karim": [
                ("protein-bites", 4),
                ("granola-cup", 2),
            ],
        }

        for user_key, entries in cart_specs.items():
            cart, _ = Cart.objects.get_or_create(user=created_users[user_key])

            for product_slug, quantity in entries:
                CartItem.objects.update_or_create(
                    cart=cart,
                    product=product_map[product_slug],
                    defaults={"quantity": quantity},
                )

        def create_order(user, street, city, country, items, status):
            total = Decimal("0.00")
            for product_slug, quantity in items:
                total += product_map[product_slug].price * quantity

            order = Order.objects.create(
                user=user,
                street=street,
                city=city,
                country=country,
                total=total,
                status=status,
            )

            for product_slug, quantity in items:
                product = product_map[product_slug]
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    price=product.price,
                    quantity=quantity,
                )

            return order

        create_order(
            user=created_users["sara"],
            street="Rue Verdun 118",
            city="Beirut",
            country="Lebanon",
            items=[("orange-blast", 2), ("cheesecake-jar", 1)],
            status=Order.Status.DELIVERED,
        )

        create_order(
            user=created_users["karim"],
            street="Bourj Hammoud 9",
            city="Metn",
            country="Lebanon",
            items=[("dates-smoothie", 1), ("protein-bites", 3)],
            status=Order.Status.PAID,
        )

        now = timezone.now()
        contact_messages_payload = [
            ("Maya Saad", "maya@example.com", "The avocado toast and orange blast were excellent!", True),
            ("Rami Daher", "rami@example.com", "Very fast delivery and fresh ingredients.", True),
            ("Tala Fares", "tala@example.com", "Could you add sugar-free dessert options?", False),
            ("Fadi Hachem", "fadi@example.com", "Best lotus cup in town.", True),
            ("Nadine Nassar", "nadine@example.com", "Loved the granola cup. Will order again.", True),
        ]

        for name, email, message, is_published in contact_messages_payload:
            defaults = {
                "message": message,
                "is_published": is_published,
                "published_at": now if is_published else None,
            }
            ContactMessage.objects.update_or_create(
                name=name,
                email=email,
                defaults=defaults,
            )

        self.stdout.write(self.style.SUCCESS("Seed completed successfully."))
        self.stdout.write("Demo users:")
        self.stdout.write(f"  - demo-admin@digitalhub.local / {demo_password}")
        self.stdout.write(f"  - sara.khaled@digitalhub.local / {demo_password}")
        self.stdout.write(f"  - karim.nader@digitalhub.local / {demo_password}")
