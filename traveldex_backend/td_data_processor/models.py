# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager
)


class Landmarks(models.Model):
    id = models.AutoField(primary_key=True)
    tag = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)
    year_built = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'landmarks'


class LandmarkReferences(models.Model):
    landmark = models.ForeignKey(Landmarks, models.DO_NOTHING)
    url = models.CharField(max_length=255)
    title = models.CharField(max_length=150, blank=True, null=True)
    source = models.CharField(max_length=100, blank=True, null=True)
    added_at = models.DateTimeField(blank=True, null=True)
    image_url = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'landmark_references'

class TdDataProcessorUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra_fields)

class TdDataProcessorUser(AbstractBaseUser):
    userId          = models.AutoField(primary_key=True)
    username        = models.CharField(max_length=255)
    email           = models.EmailField(unique=True)
    profile_pic_url = models.URLField(max_length=500, blank=True, null=True)
    password        = models.CharField(max_length=128)

    # Django required flags:
    is_active       = models.BooleanField(default=True)
    is_staff        = models.BooleanField(default=False)
    date_joined     = models.DateTimeField(auto_now_add=True)

    objects = TdDataProcessorUserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'td_data_processor_user'

class UserAlbum(models.Model):

    user = models.ForeignKey(
        TdDataProcessorUser,
        db_column='userId',
        on_delete=models.DO_NOTHING,
        related_name='albums'
    )

    pic_id = models.CharField(
        max_length=36,
        primary_key=True,
    )

    pic_url_original = models.URLField(
        max_length=500,
        blank=True,
        null=True
    )

    pic_url_annotated = models.URLField(
        max_length=500,
        blank=True,
        null=True
    )

    pic_timestamp = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'user_album'
        ordering = ['-pic_timestamp']
    
class DetectedLandmark(models.Model):
    pic = models.ForeignKey(
        UserAlbum,
        db_column='pic_id',
        on_delete=models.CASCADE,
        related_name='detected_landmarks'
    )

    class_id = models.IntegerField()

    class_name = models.CharField(max_length=255)

    x = models.FloatField(
        help_text="X coordinate of top-left corner"
    )
    y = models.FloatField(
        help_text="Y coordinate of top-left corner"
    )
    width = models.FloatField()
    height = models.FloatField()

    confidence = models.FloatField()

    class Meta:
        db_table = 'detected_landmarks'
        ordering = ['-confidence']

    def __str__(self):
        return f"{self.class_name} ({self.class_id}) in {self.pic.pic_id} @ {self.confidence:.2f}"
class ConvertedImage(models.Model):
    converted_pic_id = models.CharField(
        max_length=36,
        primary_key=True,
    )
    
    original_pic_id = models.ForeignKey(
        'td_data_processor.UserAlbum',
        to_field='pic_id',
        db_column='pic_id',
        on_delete=models.DO_NOTHING,
        related_name='converted_images'
    )
    converted_pic_url = models.URLField(
        max_length=500,
        blank=True,
        null=True
    )
    direction = models.CharField(
        max_length=50,
        help_text="e.g. 'sunny2rainy' or 'rainy2sunny'"
    )
    converted_pic_timestamp = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'converted_images'
        ordering = ['-converted_pic_timestamp']