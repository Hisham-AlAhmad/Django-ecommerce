from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ContactMessage


class ContactApiTests(APITestCase):
	def test_contact_message_create_defaults_to_unpublished(self):
		response = self.client.post(
			reverse('contact'),
			{
				'name': 'Test User',
				'email': 'test@example.com',
				'message': 'Please contact me back.',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)

		message = ContactMessage.objects.get(email='test@example.com')
		self.assertFalse(message.is_published)

	def test_testimonial_list_includes_only_published_messages(self):
		ContactMessage.objects.create(
			name='Published User',
			email='published@example.com',
			message='Great service.',
			is_published=True,
		)
		ContactMessage.objects.create(
			name='Hidden User',
			email='hidden@example.com',
			message='Private feedback.',
			is_published=False,
		)

		response = self.client.get(reverse('testimonial-list'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('results', response.data)
		self.assertEqual(len(response.data['results']), 1)
		self.assertEqual(response.data['results'][0]['name'], 'Published User')
