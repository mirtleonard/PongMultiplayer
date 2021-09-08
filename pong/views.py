from django.http import HttpResponseRedirect
from channels_presence.models import Room
from django.shortcuts import render
from django.contrib import messages

users = {}

def index(request):
    if request.method == 'POST':
        user_name = request.POST['user-name']
        if not user_name in users and user_name != 'admin':
            users[user_name] = True
            return HttpResponseRedirect(user_name + '/search')
        messages.error(request, "Username already exists!")
    return render(request, 'index.html')

def search(request, user_name):
    found = ''
    for x in Room.objects.all():
        if x.get_anonymous_count() == 1:
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
