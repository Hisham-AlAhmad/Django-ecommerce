from django.db.models import Q
from rest_framework import generics, permissions, filters
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).prefetch_related('categories')

        # Category filter accepts slugs, IDs, or a comma-separated mix.
        category = self.request.query_params.get('category')
        if category:
            values = [v.strip() for v in category.split(',') if v.strip()]
            category_ids = [int(v) for v in values if v.isdigit()]
            category_slugs = [v for v in values if not v.isdigit()]

            if category_ids and category_slugs:
                queryset = queryset.filter(
                    Q(categories__id__in=category_ids) | Q(categories__slug__in=category_slugs)
                )
            elif category_ids:
                queryset = queryset.filter(categories__id__in=category_ids)
            elif category_slugs:
                queryset = queryset.filter(categories__slug__in=category_slugs)

        # Price range filtering
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        in_stock  = self.request.query_params.get('in_stock')

        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)

        return queryset.distinct()


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Product.objects.filter(is_active=True).prefetch_related('categories')
    lookup_field = 'slug'