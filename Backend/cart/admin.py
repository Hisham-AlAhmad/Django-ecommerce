from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['subtotal']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display  = ['user', 'total_price', 'updated_at']
    search_fields = ['user__email']
    list_per_page = 25
    inlines       = [CartItemInline]
    readonly_fields = ['total_price']

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',),
        }