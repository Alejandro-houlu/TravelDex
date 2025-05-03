from django.urls import path
from . import views

urlpatterns=[
    path("ping", views.pong, name='pong'),
    path("detectFrame", views.detectFrame, name='detectFrame'),
    path('details', views.details, name='details'),
    path('auth/login',  views.LoginView.as_view(),  name='token_obtain_pair'),
    path('auth/logout', views.LogoutView.as_view(), name='token_logout'),
    path('auth/me', views.CurrentUserView.as_view(), name='current-user'),
    path('register', views.RegisterView.as_view(), name='user-register'),
    path('album', views.album, name='album'),
    path('convertImage', views.convertImage, name='convertImage'),
    path('getConvertedAlbum', views.get_converted_images, name='getConvertedAlbum')
]