from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.SimpleRouter()
router.register('invoices', views.InvoiceView, basename='invoices')
router.register('items', views.ItemView, basename='items')
router.register('products', views.ProductView, basename='product')
router.register('cash_settlement', views.CashSettlementView, basename='cash_settlement')
router.register('get_customer', views.CustomerView, basename='get_customer')
router.register('get_vendors', views.VendorView, basename='get_vendors')

urlpatterns = [
    path('', include(router.urls)),
    path('checkInvoiceNumber/<int:order_number>', views.CheckInvoiceNumber.as_view(), name='checkInvoice' ),
    path('checkItem/<str:item_code>', views.CheckItem.as_view(), name='checkItem'),
    path('update/', views.update_items, name="update_items")
    
]

