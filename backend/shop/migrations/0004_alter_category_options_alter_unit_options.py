# Generated by Django 5.1.3 on 2024-12-26 11:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0003_alter_order_order_status'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={'verbose_name': 'Категория', 'verbose_name_plural': 'Категории'},
        ),
        migrations.AlterModelOptions(
            name='unit',
            options={'verbose_name': 'Едиица измерения', 'verbose_name_plural': 'Единицы измерения'},
        ),
    ]
