import json
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
        Room.objects.add(self.room_name, self.user_name, User.objects.get(username=self.user_name))
        print(Room.get_users(1))
        #print(Room.objects.all()[0].__dict__)
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'user_name': data['user_name'],
                'speed': data['speed'],
                'type': 'play',
            }
        )

    def play(self, event):
        self.send(text_data=json.dumps({
            'speed': event['speed'],
            'user_name': event['user_name']
        }))
