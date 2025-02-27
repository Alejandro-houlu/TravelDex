from django.db import models

# Create your models here.

class User(models.Model):
    userId = models.AutoField(primary_key=True)  # Automatically increments and serves as the primary key
    username = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    profile_pic_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.username
