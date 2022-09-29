
from django.contrib import admin
from .models import Item, Product, Return_Invoice
#from import_export.admin import ImportExportModelAdmin
#from import_export import resources
from .models import Item

#class ItemResource(resources.ModelResource):
#    class Meta:
#        model = Item
#        skip_unchanged = True
#        fields = ("id", "barcode", "description", "price")
    
#class CustomItemAdmin(ImportExportModelAdmin ):
#    search_fields = ["barcode"]
#    resource_class = ItemResource
    
class Return_ProductAdmin(admin.ModelAdmin):
    search_fields = ['status', 'profile' ]

class ProductAdmin( admin.ModelAdmin ):
    search_fields = [ 'barcode' ]

#class InvoiceResource(resources.ModelResource):
#    class Meta:
#        model = Invoice
#        skip_unchanged = True
#        fields = ("order_number", "collection_point__name", "invoiced_amount", "payment_method", "status" )

#class CustomInvoiceAdmin( ImportExportModelAdmin ):
#     search_fields = [ 'order_number', 'customer_name', 'customer_phone' ]
#     resource_class = InvoiceResource

admin.site.register(Item)
#admin.site.register(Product)

