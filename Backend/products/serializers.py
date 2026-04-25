from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    categories_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='categories',
        many=True,
        write_only=True,
        required=False,
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        required=False,
    )
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'categories', 'category_id', 'categories_ids', 'name', 'slug',
            'description', 'price', 'stock', 'in_stock', 'image', 'is_active'
        ]

    def get_category(self, obj):
        primary_category = obj.primary_category
        if not primary_category:
            return None
        return CategorySerializer(primary_category).data

    def _resolve_categories_data(self, validated_data):
        category = validated_data.pop('category_id', None)
        categories = validated_data.pop('categories', None)

        if category and not categories:
            categories = [category]

        return categories

    def create(self, validated_data):
        categories = self._resolve_categories_data(validated_data)
        product = super().create(validated_data)
        if categories is not None:
            product.categories.set(categories)
        return product

    def update(self, instance, validated_data):
        categories = self._resolve_categories_data(validated_data)
        product = super().update(instance, validated_data)
        if categories is not None:
            product.categories.set(categories)
        return product