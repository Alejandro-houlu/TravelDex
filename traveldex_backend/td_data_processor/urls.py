from django.urls import path
from . import views

urlpatterns=[
    path("ping", views.pong, name='pong'),
    path("processFile", views.processFile, name='processFile')
]