from django.urls import path
from . import views

urlpatterns = [
    path('<str:user_name>', views.search, name='search'),
    path('<str:room_name>/<str:user_name>/game', views.game, name='game'),
]
