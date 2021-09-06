#from .consumers import rooms_number
from channels_presence.models import Room
from django.shortcuts import render
from django.http import HttpResponseRedirect

def search(request, user_name):
    found = ''
    for x in Room.objects.all():
        #print(x)
        #print(x.get_users())
        #print(x.get_anonymous_count())
        if x.get_users().count() == 1:
            found = x.channel_name
            break
    if found == '':
        found = user_name
    return HttpResponseRedirect(found +  '/' + user_name + '/game')

def game(request, room_name, user_name):
    return render(request, 'game.html', {
        'room_name' : room_name,
        'user_name' : user_name
    })
