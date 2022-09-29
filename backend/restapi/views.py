
import decimal
# Create your views here.
from django.shortcuts import render
from users.models import Profile
from .models import Item, Invoice, Product, CashSettlement, Customer
from django.core.mail import send_mail
from rest_framework import viewsets, status, filters
from .serializers import ItemSerializer, ProfileSerializer, InvoiceSerializer,\
    ProductSerializer, CashSettlementSerializer, CashSettlementListSerializer, CustomerSerializer
from rest_framework.decorators import action

from drf_multiple_model.viewsets import ObjectMultipleModelAPIViewSet
from rest_framework import authentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import pagination
from rest_framework import generics
from rest_framework import mixins, viewsets
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
import django_filters.rest_framework
import requests
from django.http import HttpResponse

# SEND EMAIL
def email( subject, message, to_email ):
    from_email = "care.dhaka@decathlon.com"
    send_mail(
        subject, 
        message, 
        from_email, 
        to_email, 
        fail_silently = True,
        )    

from .serializers import InvoiceListSerializer

class CheckInvoiceNumber(APIView):
    permission_classes = [AllowAny]
    def get(self, request, order_number):
        if Invoice.objects.filter(order_number=order_number).exists():
            response = {'message' : 'invalid'}
        else : 
            response = {'message' : 'valid'}
        return Response(response, status=status.HTTP_200_OK)

class CheckItem(APIView):
    permission_classes = [AllowAny]
    def get(self, request, item_code):
        code = item_code.upper()
        if Item.objects.filter(itemcode=code).exists() or Item.objects.filter(barcode=code).exists():
            response = {'message' : 'valid'}
        else: 
            response = {'message' : 'invalid'}
        return Response(response, status=status.HTTP_200_OK)
        

class CustomPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 10000
    page_query_param = 'p'
    

class InvoiceView(viewsets.ModelViewSet):

    pagination_class = CustomPagination

    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    search_fields = [
        'order_number', 
        'customer__name',
        'customer__email',
        'customer__phone'
    ]
    
    filterset_fields = {
        'payment_method' : ['exact'],
        'collection_point' : ['exact'],
        'status' : ['exact'], 
        'created' : ['gte', 'lte'],
        'updated' : ['gte', 'lte'],
        'cash_settled' : ['exact'],
        'commission_settled' : ['exact']
    }

    ordering_fields = [
        'order_number',
        'created',
        'updated'
    ]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'delete']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        else:
            return InvoiceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Invoice.objects.all()
        else:
            profile = get_object_or_404(Profile, user=user)
            return Invoice.objects.filter(collection_point=profile)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def get_serializer_context(self):
        context = super(InvoiceView, self).get_serializer_context()
        context.update({'request':self.request})
        return context

class ItemView(viewsets.ModelViewSet):

    pagination_class = None

    filter_backends = [
        filters.SearchFilter
    ]

    search_fields = [
        'itemcode',
        'barcode'
    ]

    def get_permissions(self):
        if self.action in ['create', 'update', 'delete']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]
    
    serializer_class = ItemSerializer
    queryset = Item.objects.all()

class ProductView(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Product.objects.all()
        else:
            profile = get_object_or_404(Profile, user=user)
            invoices = Invoice.objects.filter(collection_point=profile)
            return Product.objects.filter(invoiced__in=invoices)
           
class CashSettlementView(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    def get_serializer_class(self):
        if self.action == 'list':
            return CashSettlementSerializer
        else:
            return CashSettlementSerializer
    def get_permission(self):
        if self.action in ['create', 'delete']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return CashSettlement.objects.all()
        else:
            profile = get_object_or_404(Profile, user=user)
            return CashSettlement.objects.filter(profile=profile)

class CustomerView(viewsets.ModelViewSet):
    filter_backends = [
        filters.SearchFilter
    ]
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()
    search_fields = [
        'email', 
        'phone'
    ]

class VendorView(mixins.ListModelMixin, viewsets.GenericViewSet):
    pagination_class = None
    serializer_class = ProfileSerializer
    queryset = Profile.objects.filter(is_vendor=True)


def update_items(request):
    created = 0
    updated = 0
    skipped = 0
    response = requests.get(
        'http://103.123.11.189/Decathlon/api/Product/10001/', 
        headers={'Authorization':'matthew:nsoYWY6Fh/8QtRS1R2o7AQ=='}
    )
    if response.status_code == 200:
        data_set = response.json()
        for data in data_set:
            if data['USER_BARCODE'] :
                barcode = data['BARCODE']
                description = data['DISPLAY_NAME']
                price = data['MRP']
                item_code = None
                code = data['USER_BARCODE']
                separated_code = code.split(',')
                for n in separated_code:
                    n = n.strip()
                    if len(n) != 13:
                        item_code = n
                try:
                    item = Item.objects.get(barcode=barcode)
                    item.description = description
                    item.price = price
                    item.itemcode = item_code
                    item.save()
                    updated += 1
                except Item.DoesNotExist:
                    item = Item.objects.create(barcode=barcode, description=description, price=price, itemcode=item_code)
                    item.save()
                    created += 1
            else:
                skipped += 1
                continue
        return Response({'message' : f'Created = {created}, Updated = {updated}, Skipped = {skipped}'}, status=status.HTTP_200_OK)
    else:
        return Response({'message' : 'Failed to load data from api call'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                   
                    

            
            




