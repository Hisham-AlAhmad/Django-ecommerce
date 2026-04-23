from rest_framework import generics, permissions
from .models import ContactMessage
from .serializers import ContactMessageSerializer, TestimonialSerializer


class ContactMessageView(generics.CreateAPIView):
    serializer_class   = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]


class TestimonialListView(generics.ListAPIView):
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # BUGFIX: Old frontend had no source for testimonials. This filters to moderated/published messages only.
        return ContactMessage.objects.filter(is_published=True).order_by('-published_at', '-created_at')