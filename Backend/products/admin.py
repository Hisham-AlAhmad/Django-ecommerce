from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'product_count']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(product_total=Count('products'))

    @admin.display(description='Products')
    def product_count(self, obj):
        return obj.product_total


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_list', 'price', 'stock', 'is_active', 'created_at']
    list_filter = ['categories', 'is_active', 'created_at']
    search_fields = ['name', 'slug', 'description', 'categories__name']
    list_editable = ['price', 'stock', 'is_active']
    list_per_page = 25
    ordering = ['-created_at']
    filter_horizontal = ['categories']
    readonly_fields = ['created_at']
    prepopulated_fields = {'slug': ('name',)}

    fieldsets = (
        ('Product Basics', {
            'fields': ('name', 'slug', 'description', 'categories'),
        }),
        ('Inventory & Pricing', {
            'fields': ('price', 'stock', 'is_active'),
        }),
        ('Media & Metadata', {
            'fields': ('image', 'created_at'),
        }),
    )

    actions = ['mark_active', 'mark_inactive']

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.prefetch_related('categories')

    @admin.display(description='Categories')
    def category_list(self, obj):
        all_categories = list(obj.categories.all())
        categories = [category.name for category in all_categories[:3]]
        if not categories:
            return format_html('<span style="color:#6b7280;">Uncategorized</span>')
        if len(all_categories) > 3:
            categories.append('...')
        return ', '.join(categories)

    @admin.action(description='Mark selected products as active')
    def mark_active(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description='Mark selected products as inactive')
    def mark_inactive(self, request, queryset):
        queryset.update(is_active=False)

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',),
        }