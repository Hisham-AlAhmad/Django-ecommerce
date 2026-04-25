from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address


admin.site.site_header = 'DigitalHub Commerce Admin'
admin.site.site_title = 'DigitalHub Admin'
admin.site.index_title = 'Operations Dashboard'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'is_staff', 'date_joined']
    list_filter = ['is_staff', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',),
        }


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'country', 'is_default']
    list_filter = ['country', 'is_default']
    search_fields = ['user__email', 'city', 'street']

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',),
        }
