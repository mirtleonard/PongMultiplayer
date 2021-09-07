from channels_presence.models import Room
from django.shortcuts import render
from django.http import HttpResponseRedirect

def index(request):
    return render(request, 'index.html')

def search(request, user_name):
    found = ''
    for x in Room.objects.all():
        if x.get_users().count() == 1:
            found = x.channel_name
            break
    if found == '':
        found = user_name
    return HttpResponseRedirect(found + '/game')

def game(request, room_name, user_name):
    return render(request, 'game.html', {
        'room_name' : room_name,
        'user_name' : user_name
    })
