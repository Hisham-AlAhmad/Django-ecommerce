from django.contrib import admin
from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display  = ['name', 'email', 'is_published', 'published_at', 'created_at']
    search_fields = ['name', 'email']
    list_filter = ['is_published', 'created_at']
    readonly_fields = ['created_at']