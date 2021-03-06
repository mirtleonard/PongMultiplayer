from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'(?P<room_name>\w+)/(?P<user_name>\w+)/game/$', consumers.GameConsumer.as_asgi()),
    re_path(r'(?P<room_name>\w+)/(?P<user_name>\w+)/chat/$', consumers.ChatConsumer.as_asgi()),
]
