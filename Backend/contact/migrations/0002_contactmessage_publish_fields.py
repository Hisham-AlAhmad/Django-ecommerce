# Generated manually for publishable testimonials support.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='contactmessage',
            name='is_published',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='contactmessage',
            name='published_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
