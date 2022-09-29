from rest_framework import serializers
from .models import Item, Invoice, Product, Customer, \
    CashSettlement, CommissionSettlement , Return_Invoice
from users.models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "id",
            "name",
            "phone", 
            "location", 
            "email",
        ]

class ProfileRelatedField(serializers.RelatedField):
    def to_representation(self, value):
        return value.name

    def to_internal_value(self, data):
        return Profile.objects.get(name=data)

class ItemRelatedField(serializers.RelatedField):
    def to_representation(self, value):
        return value.barcode

    def to_internal_value(self, data):
        return Item.objects.get(barcode=data)

class InvoiceRelatedField(serializers.RelatedField):
    def to_representation(self, value):
        return value.order_number

    def to_internal_value(self, data):
        return Invoice.objects.get(order_number=data)
        
class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = [
            "id",
            "barcode",
            "itemcode",
            "description", 
            "price"
        ]

class ProductSerializer(serializers.ModelSerializer):
    item = ItemRelatedField(queryset=Item.objects.all())
    class Meta:
        model = Product
        fields = [
            'id',
            'item', 
            'quantity',
            'discount', 
            'total'
        ]
        read_only_fields = [
            'id',
            'total'
        ]
    
    def update(self, instance, validated_data):
        new_quantity = validated_data.get('quantity', 0)
        prev_quantity = instance.quantity
        adj_qty = prev_quantity - new_quantity
        invoice = Invoice.objects.get(products=instance)
        if new_quantity != prev_quantity:
            if new_quantity == 0:
                #remove from existing invoice
                pass
            else:
                #adjust qty
                pass
            #create return_invoice
            instance.quantity = new_quantity
        instance.save()
        #send email
        return instance

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class InvoiceSerializer(serializers.ModelSerializer):
    collection_point = ProfileRelatedField(queryset=Profile.objects.all())
    customer = CustomerSerializer()
    products = ProductSerializer(many=True)
    settlement = serializers.StringRelatedField(many=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "order_number",
            "customer",
            "collection_point", 
            "status", 
            "invoiced_amount",
            "payment_method",
            "created",
            "updated",
            "boxes",
            "invoice_total",
            "invoice_commission",
            "products",
            "settlement"
        ]
        read_only_fields = [
            'created', 
            'updated',
            'id'
        ]

    def create(self, validated_data):
        customer_data = validated_data.pop('customer')
        products = validated_data.pop('products')
        customer = Customer.objects.filter(phone=customer_data['email']).first()
        if not customer:
            customer = Customer.objects.create(**customer_data)
        invoice = Invoice.objects.create(**validated_data, customer=customer)
        for product in products:
            p = Product.objects.create(**product)
            invoice.products.add(p)
        invoice.save()
        #send email
        return invoice

    def update(self, instance, validated_data):
        user = None
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
        if user and user.is_staff:
            instance.order_number = validated_data.get('order_number', instance.order_number)
            instance.collection_point = validated_data.get('collection_point', instance.collection_point)
            instance.status = validated_data.get('status', instance.status)
            instance.payment_method = validated_data.get('payment_method', instance.payment_method)
            instance.boxes = validated_data.get('boxes', instance.boxes)
            instance.status = validated_data.get('status', instance.status)
        else:
            status = validated_data.get('status', instance.status)
            instance.status = status
            if status == 'CANCELLED':
                credit_note = Return_Invoice.objects.create(
                    invoice = instance,
                )
                if instance.products:
                    for product in instance.products.all():
                        credit_note.products.add(product)
                credit_note.save()
        instance.save()
        return instance

class ReturnInvoiceSerializer(serializers.ModelSerializer):
    invoice = serializers.StringRelatedField()
    products = ProductSerializer(many=True)
    received_by = serializers.StringRelatedField()
    class Meta:
        model = Return_Invoice
        fields = [
            'invoice', 
            'products',
            'created',
            'updated', 
            'received_by'
        ]
   
class InvoiceListSerializer(serializers.ModelSerializer):
    collection_point = serializers.StringRelatedField()
    class Meta:
        model = Invoice
        fields = [
            'id',
            'order_number',
            'status', 
            'collection_point',
            'commission_settled',
            'cash_settled'
        ]

class CashSettlementSerializer(serializers.ModelSerializer):
    profile = ProfileRelatedField(queryset=Profile.objects.all())
    invoices = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.filter(settlement=None), many=True)
    amount = serializers.ReadOnlyField()
    class Meta:
        model = CashSettlement
        fields = [
            'id',
            'profile',
            'invoices',
            'paid',
            'verified',
            'verified_by',
            'timestamp', 
            'updated', 
            'amount'
        ]
        read_only_fields = [
            'id',
            'verified_by', 
            'timestamp',
            'updated',
            'amount'
        ]
    
    def validate(self, data):
        profile = Profile.objects.get(name=data['profile'])
        for invoice in data['invoices']:
            i = Invoice.objects.get(order_number=invoice)
            if i.collection_point != profile:
                raise serializers.ValidationError(f'Invoice {invoice} is not processed for {profile}')
            elif i.payment_method != 'PENDING PAYMENT':
                raise serializers.ValidationError('Only cash on delivery orders can be added to cash settlement')
            elif invoice.settlement.all().exists():
                raise serializers.ValidationError(f'{invoice} has already been settled')
        return data
    
    def update(self, instance, validated_data):
        instance.paid = validated_data.get('paid', instance.paid)
        instance.verified = validated_data.get('verified', instance.verified)

class CashSettlementListSerializer(serializers.ModelSerializer):
    profile = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = CashSettlement
        fields = [
            'id',
            'profile',
            'timestamp', 
            'paid', 
            'verified', 
            'amount'
        ]

