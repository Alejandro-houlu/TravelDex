from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

from td_data_processor.models import TdDataProcessorUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = TdDataProcessorUser
        fields = ('email', 'username', 'password')

    def create(self, validated_data):
        return TdDataProcessorUser.objects.create_user(**validated_data)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # custom claims:
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['status'] = 'success'
        data['data'] = {
            'userId':   self.user.userId,
            'email':    self.user.email,
            'username': self.user.username,
            'profile_pic_url': self.user.profile_pic_url,
        }
        return data
