from rest_framework import serializers
from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ContactMessage
        fields = ['id', 'name', 'email', 'message', 'is_published', 'published_at', 'created_at']
        # BUGFIX: Prevent clients from publishing their own messages.
        read_only_fields = ['id', 'is_published', 'published_at', 'created_at']


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'message', 'created_at']