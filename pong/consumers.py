import json
from . import pong
from .views import users
from asgiref.sync import async_to_sync
from channels_presence.models import Room
from django.contrib.auth.models import User
from channels_presence.decorators import remove_presence
from channels.generic.websocket import WebsocketConsumer

games = {}

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user_name = self.scope['url_route']['kwargs']['user_name']
        for x in Room.objects.all():
            print(x.__dict__)
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        Room.objects.add(self.room_name, self.user_name)

        #Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'message': message,
                'type': 'chat_message',
                'user_name': self.user_name,
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': event['message'],
            'user_name': event['user_name']
        }))

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

        if self.room_name in games:
            games[self.room_name].player[1].name = self.user_name
        else:
            games[self.room_name] = pong.Game(self.user_name, 'Waiting for player...', 700, 700)

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    @remove_presence
    def disconnect(self, close_code):
        Room.objects.remove(self.room_name, self.user_name)
        room = Room.objects.get(channel_name = self.room_name)
        if room.get_users().count() + room.get_anonymous_count():
            room.delete()
            users.pop(self.user_name)
            games.pop(self.room_name)
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        current = 1
        if data['user_name'] == games[self.room_name].player[0].name:
            current = 0

        games[self.room_name].player[current].ready = data['ready']
        if data['speed'] == 0:
            games[self.room_name].paddle[current].speed = 0
        elif data['speed'] > 0:
            games[self.room_name].paddle[current].speed = 10
        elif data['speed'] < 0:
            games[self.room_name].paddle[current].speed = -10

        if games[self.room_name].player[current].ready and games[self.room_name].player[current].ready:
            games[self.room_name].update()


        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'play',
            }
        )

    def play(self, event):
        self.send(text_data=json.dumps({
            'users' : [
                {
                   'paddle_x' : games[self.room_name].paddle[0].x,
                   'paddle_y' : games[self.room_name].paddle[0].y,
                   'score' : games[self.room_name].player[0].score,
                   'ready' : games[self.room_name].player[0].ready,
                   'user_name': games[self.room_name].player[0].name,
                },
                {
                   'paddle_x' : games[self.room_name].paddle[1].x,
                   'paddle_y' : games[self.room_name].paddle[1].y,
                   'score' : games[self.room_name].player[1].score,
                   'ready' : games[self.room_name].player[1].ready,
                   'user_name': games[self.room_name].player[1].name,
                },
            ],
            'ball_x' : games[self.room_name].ball.x,
            'ball_y' : games[self.room_name].ball.y,
        }))
