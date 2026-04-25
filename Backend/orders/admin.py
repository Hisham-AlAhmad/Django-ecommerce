from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model         = OrderItem
    extra         = 0
    autocomplete_fields = ['product']
    can_delete = False
    readonly_fields = ['product_name', 'price', 'quantity', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_email', 'status_badge', 'status', 'total', 'item_count', 'created_at']
    list_filter = ['status', 'created_at', 'country']
    search_fields = ['id', 'user__email', 'street', 'city', 'country']
    list_editable = ['status']
    list_select_related = ['user']
    list_per_page = 30
    date_hierarchy = 'created_at'
    readonly_fields = ['total', 'created_at']
    inlines = [OrderItemInline]
    ordering = ['-created_at']

    fieldsets = (
        ('Order Summary', {
            'fields': ('user', 'status', 'total', 'created_at'),
        }),
        ('Shipping Address', {
            'fields': ('street', 'city', 'country'),
        }),
    )

    actions = ['mark_pending', 'mark_paid', 'mark_shipped', 'mark_delivered']

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('user').annotate(items_total=Count('items'))

    @admin.display(description='Customer', ordering='user__email')
    def user_email(self, obj):
        return obj.user.email

    @admin.display(description='Status')
    def status_badge(self, obj):
        colors = {
            Order.Status.PENDING: '#9ca3af',
            Order.Status.PAID: '#2563eb',
            Order.Status.SHIPPED: '#7c3aed',
            Order.Status.DELIVERED: '#16a34a',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:{}20;color:{};font-weight:600;">{}</span>',
            color,
            color,
            obj.get_status_display(),
        )

    @admin.display(description='Items')
    def item_count(self, obj):
        return obj.items_total

    @admin.action(description='Mark selected orders as Pending')
    def mark_pending(self, request, queryset):
        queryset.update(status=Order.Status.PENDING)

    @admin.action(description='Mark selected orders as Paid')
    def mark_paid(self, request, queryset):
        queryset.update(status=Order.Status.PAID)

    @admin.action(description='Mark selected orders as Shipped')
    def mark_shipped(self, request, queryset):
        queryset.update(status=Order.Status.SHIPPED)

    @admin.action(description='Mark selected orders as Delivered')
    def mark_delivered(self, request, queryset):
        queryset.update(status=Order.Status.DELIVERED)

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',),
        }