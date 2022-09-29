from django.db import models
from django.db import models
from users.models import Profile
from django.core.validators import MinValueValidator
from django.urls import reverse
from django.core.mail import send_mail
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
import decimal

class Customer(models.Model):
    phone = models.CharField(max_length=16)
    name = models.CharField(max_length=64)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.email

class Item(models.Model):
    barcode = models.CharField(max_length=16, unique=True)
    itemcode = models.CharField(max_length=8, unique=True, null=True)
    description = models.CharField(max_length=256)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True)

    class Meta:
        ordering = ['barcode']
    
    def __str__(self):
        return(f"{self.barcode} {self.description} {self.price}")

    def clean(self):
        if self.itemcode and not self.itemcode.isdigit():
            raise ValidationError('Item Code must be numeric')

    def save(self, *args, **kwargs):
        self.clean()
        self.barcode = self.barcode.upper()
        super(Item, self).save(*args, **kwargs)

# Invoice row 
class Product(models.Model):
    item = models.ForeignKey(Item, on_delete=models.PROTECT)
    unit_price = models.DecimalField(default=0.00, decimal_places=2, max_digits=10)
    quantity = models.PositiveIntegerField(default=1)
    discount = models.DecimalField(default=0.00, max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return(f"{self.item.barcode} {self.item.description} {self.quantity} {self.item.price}")

    def save(self, *args, **kwargs):
        if self.id == None or self.unit_price < 1:
            self.unit_price = self.item.price
        self.total = decimal.Decimal((self.unit_price - self.discount) * self.quantity)
        super(Product, self).save(*args, **kwargs)

class Invoice(models.Model):

    class InvoiceStatus(models.TextChoices):
        PROCESSING = 'PROCESSING', _('Processing')
        READY_FOR_DELIVERY = 'READY_FOR_DELIVERY', _('Ready for Delivery')
        DELIVERED = 'DELIVERED', _('Delivered')
        CANCELLED = 'CANCELLED', _('Cancelled')

    class PaymentMethods(models.TextChoices):
        PENDING_PAYMENT = "PENDING_PAYMENT", _('Cash On Delivery')
        PREPAID = "PREPAID", _('Prepaid')
    
    order_number = models.CharField(max_length=32, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True)
    collection_point = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='invoice', limit_choices_to={'is_vendor': True})
    products = models.ManyToManyField(Product, related_name="invoiced")
    status = models.CharField(choices=InvoiceStatus.choices, max_length=24, default=InvoiceStatus.PROCESSING)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    payment_method = models.CharField(choices=PaymentMethods.choices, max_length=16, default=PaymentMethods.PENDING_PAYMENT)
    invoice_total = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    complete = models.BooleanField(default=False)
    boxes = models.IntegerField(default=1, blank=True)
    invoice_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cash_settled = models.BooleanField(default=False)
    commission_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    commission_settled = models.BooleanField(default=False)

    class Meta:
        order_with_respect_to = 'collection_point'   

    def __str__(self):
        return self.order_number

    def clean(self):
        if not self.order_number.isdigit():
            raise ValidationError('Order Number must be numeric')
        
    def save(self, *args, **kwargs):
        self.clean()
        total = decimal.Decimal(0.00)
        for product in self.products.all():
            total += decimal.Decimal(product.total)
        if self.discount > 0.00:
            total -= decimal.Decimal(self.invoice_discount)
        self.invoice_total = total
        if self.status=="DELIVERED":
            self.commission_made = self.invoiced_amount * self.collection_point.commission
        if self.status == "DELIVERED" or self.status == "CANCELLED":  
            self.complete = True
        super(Invoice, self).save(*args, **kwargs)

class Return_Invoice(models.Model):

    class StatusChoices(models.TextChoices):
        PENDING = 'PENDING', _("Pending")
        RETURNED = 'RETURNED', _('Returned')

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    products = models.ManyToManyField(Product)
    invoice_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=16, choices=StatusChoices.choices)
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, limit_choices_to={'is_staff': True}, on_delete=models.SET_NULL)

    def __str__(self):
        return self.invoice.order_number

    def save(self, *args, **kwargs):
        total = decimal.Decimal(0.00)
        for product in self.products.all():
            total += decimal.Decimal(product.total)
        self.invoice_total = total
        super(Return_Invoice, self).save(*args, **kwargs)


class CashSettlement(models.Model):
    profile = models.ForeignKey(Profile, limit_choices_to={"is_vendor":'True'}, on_delete=models.SET_NULL, null=True, blank=True)
    invoices = models.ManyToManyField(Invoice, related_name='settlement', limit_choices_to={'payment_method':'PENDING_PAYMENT', 'status':'DELIVERED'})
    amount = models.DecimalField(max_digits=16, decimal_places=2, default=0.00)
    paid = models.BooleanField(default=False)
    generated = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    paid_on = models.DateTimeField(auto_now=True)
    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return f"{self.id}"

    class Meta:
        order_with_respect_to = 'profile'
        get_latest_by = 'timestamp'

    def save(self, *args, **kwargs):
        if not self.id:
            amount = 0.00
            for invoice in self.invoices.all():
                amount += invoice.invoiced_amount
            self.amount = amount
            
        super(CashSettlement, self).save(*args, **kwargs)

class CommissionSettlement(models.Model):
    profile = models.ForeignKey(Profile, limit_choices_to={'is_vendor': 'True'}, on_delete=models.SET_NULL, null=True, blank=True)
    invoices = models.ManyToManyField(Invoice, related_name='commission_paid')
    timestamp = models.DateTimeField(auto_now_add=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    commission_amount = models.DecimalField(max_digits=16, decimal_places=2, default=0.00)
    
    def __str__(self):
        return f"{self.profile} - {self.timestamp}"

    class Meta:
        order_with_respect_to = 'profile'
        get_latest_by = 'timestamp'

    def save(self, *args, **kwargs):
        if not self.id:
            commission_amount = decimal.Decimal(0.00)
            total_invoice = decimal.Decimal(0.00)
            for invoice in self.invoices.all():
                total_invoiced += invoice.invoiced_amount
            commission_amount = (total_invoiced * self.profile.commission) / 100
            self.commission_amount = commission_amount
        super(CommissionSettlement, self).save(*args, **kwargs)
            

class Log(models.Model):
    action = models.CharField(max_length=255)
    message = models.CharField(max_length=255)
    status = models.CharField(max_length=8)
    timestamp = models.DateTimeField(auto_now_add=True)

