from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

# Create your models here.
class Profile(models.Model):
    user = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='managed_profile')
    name = models.CharField(max_length=64)
    phone = models.CharField(max_length=16, unique=True)
    location = models.CharField(max_length=16)
    city = models.CharField(max_length=16)
    address = models.TextField(max_length=164)
    email = models.EmailField(max_length=164)
    business_hours = models.CharField(max_length=164, null=True, blank=True)
    is_vendor = models.BooleanField(default=True)
    is_auditor = models.BooleanField(default=False)
    commission = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        #self.clean()
        super(Profile, self).save(*args, **kwargs)
    
    def __str__(self):
        return self.name


 