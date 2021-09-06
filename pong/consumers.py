import json
from . import pong
from asgiref.sync import async_to_sync
from channels_presence.models import Room
from django.contrib.auth.models import User
from channels.generic.websocket import WebsocketConsumer

rooms_number = 0
class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.user_name = self.scope['url_route']['kwargs']['user_name']
        self.room_group_name = 'pong_%s' % self.room_name
        try:
            Room.objects.add(self.room_name, self.user_name, User.objects.get(username=self.user_name))
        except:
            Room.objects.add(self.room_name, self.user_name)

        room = Room.objects.get(channel_name = self.room_name)
        print(room.get_anonymous_count())

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        print(close_code, 'aici')
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'user_name': data['user_name'],
                'ready' : data['ready'],
                'speed': data['speed'],
                'type': 'play',
            }
        )

    def play(self, event):
        self.send(text_data=json.dumps({
            'ball': {},
            'user_name': event['user_name'],
            'ready' : event['ready'],
        }))
