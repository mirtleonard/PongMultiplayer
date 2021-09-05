#from .consumers import rooms_number
from django.shortcuts import render
from django.http import HttpResponseRedirect

def search(request, user_name):
    #for x in range(rooms_number):
    #        if getattr(self.channel_layer, 'room' + str(x + 1), 0) == 1:
    #            setattr(self.channel_layer, 'room' + str(x + 1), 2)
    #            self.room_name = 'room' + str(x + 1)
    #            break
    #if getattr(self, room_name, 0) == 0:
    #    slef.room_name = 'room' + str(rooms_number)
    #    setattr(self.channel_layer, self.room_name, 1)
    #    rooms_number += 1

    return HttpResponseRedirect('room1/' + user_name + '/game')

def game(request, room_name, user_name):
    return render(request, 'game.html', {
        'room_name' : room_name,
        'user_name' : user_name
    })
