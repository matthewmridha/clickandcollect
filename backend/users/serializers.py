from rest_framework import serializers
from rest_framework import viewsets, status
#from django.contrib.auth.models import User
from backend.models import User
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            'username',
            'email'

            ]
        #extra_kwargs = {"password" : {'write_only' : True, 'required' : True}}
'''
    def create(self, validated_data):
        print("create")
        user = User.objects.create_user(**validated_data)
        Token.objects.create(user=user)
        return user
        '''
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'id',
            'name', 
            'phone', 
            'location', 
            'city', 
            'address', 
            'email', 
            'business_hours',
            'is_vendor',
            'is_auditor',
            'is_staff',
            'commission'
        ]

class CustomUserDetailSerializer(serializers.ModelSerializer):
    managed_profile = ProfileSerializer(read_only=True, many=True)
    class Meta:
        model = User
        fields = [
            'username', 
            'managed_profile',
            'is_staff',
            'is_auditor',
            'is_vendor'
        ]
        