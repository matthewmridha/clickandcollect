# Generated by Django 4.0.4 on 2022-06-25 10:28

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone', models.CharField(max_length=16)),
                ('name', models.CharField(max_length=64)),
                ('email', models.EmailField(max_length=254, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order_number', models.CharField(max_length=32, unique=True)),
                ('status', models.CharField(choices=[('PROCESSING', 'Processing'), ('READY_FOR_DELIVERY', 'Ready for Delivery'), ('DELIVERED', 'Delivered'), ('CANCELLED', 'Cancelled')], default='PROCESSING', max_length=24)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('payment_method', models.CharField(choices=[('PENDING_PAYMENT', 'Cash On Delivery'), ('PREPAID', 'Prepaid')], default='PENDING_PAYMENT', max_length=16)),
                ('invoice_total', models.DecimalField(decimal_places=2, default=0.0, max_digits=8)),
                ('complete', models.BooleanField(default=False)),
                ('boxes', models.IntegerField(blank=True, default=1)),
                ('invoice_discount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('cash_settled', models.BooleanField(default=False)),
                ('commission_earned', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('commission_settled', models.BooleanField(default=False)),
                ('collection_point', models.ForeignKey(limit_choices_to={'is_vendor': True}, on_delete=django.db.models.deletion.CASCADE, related_name='invoice', to='users.profile')),
                ('customer', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='restapi.customer')),
            ],
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('barcode', models.CharField(max_length=16, unique=True)),
                ('itemcode', models.CharField(max_length=8, null=True, unique=True)),
                ('description', models.CharField(max_length=256)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, null=True)),
            ],
            options={
                'ordering': ['barcode'],
            },
        ),
        migrations.CreateModel(
            name='Log',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(max_length=255)),
                ('message', models.CharField(max_length=255)),
                ('status', models.CharField(max_length=8)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('unit_price', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('discount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('total', models.DecimalField(decimal_places=2, max_digits=10)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='restapi.item')),
            ],
        ),
        migrations.CreateModel(
            name='Return_Invoice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invoice_total', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('RETURNED', 'Returned')], max_length=16)),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='restapi.invoice')),
                ('products', models.ManyToManyField(to='restapi.product')),
                ('received_by', models.ForeignKey(blank=True, limit_choices_to={'is_staff': True}, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='invoice',
            name='products',
            field=models.ManyToManyField(related_name='invoiced', to='restapi.product'),
        ),
        migrations.AlterOrderWithRespectTo(
            name='invoice',
            order_with_respect_to='collection_point',
        ),
        migrations.CreateModel(
            name='CommissionSettlement',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('commission_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=16)),
                ('invoices', models.ManyToManyField(related_name='commission_paid', to='restapi.invoice')),
                ('profile', models.ForeignKey(blank=True, limit_choices_to={'is_vendor': 'True'}, null=True, on_delete=django.db.models.deletion.SET_NULL, to='users.profile')),
                ('verified_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'get_latest_by': 'timestamp',
                'order_with_respect_to': 'profile',
            },
        ),
        migrations.CreateModel(
            name='CashSettlement',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=16)),
                ('paid', models.BooleanField(default=False)),
                ('generated', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('paid_on', models.DateTimeField(auto_now=True)),
                ('verified', models.BooleanField(default=False)),
                ('invoices', models.ManyToManyField(limit_choices_to={'payment_method': 'PENDING_PAYMENT', 'status': 'DELIVERED'}, related_name='settlement', to='restapi.invoice')),
                ('profile', models.ForeignKey(blank=True, limit_choices_to={'is_vendor': 'True'}, null=True, on_delete=django.db.models.deletion.SET_NULL, to='users.profile')),
                ('verified_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'get_latest_by': 'timestamp',
                'order_with_respect_to': 'profile',
            },
        ),
    ]