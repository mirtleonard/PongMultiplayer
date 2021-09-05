from django.contrib.auth import login, logout, authenticate
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.shortcuts import render
from django.urls import reverse


# Create your views here.
def index(request):
    if (request.user.username != ""):
        return HttpResponseRedirect('profile')
    return render(request, 'login.html')


def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        if not User.objects.filter(username = username).exists():
            password = request.POST.get('password')
            repeated_password = request.POST.get('repeated_password')
            print(password, repeated_password);
            if repeated_password == password:
                user = User(username = username)
                user.set_password(password)
                user.save()
                messages.success(request, "User successfully created")
                return index(request)
            else:
                messages.error(request, "Passwords do not match.")
        else:
            messages.error(request, "Username already exists.")
        return render(request, 'register.html')
    else:
        return render(request, 'register.html')

def login_user(request):
    username = request.POST.get('username')
    password = request.POST.get('password')
    user = authenticate(username = username, password = password)
    if user is not None:
        login(request, user)
        return HttpResponseRedirect(reverse('profile'))
    messages.error(request, "User doesn't exist!")
    return HttpResponseRedirect(reverse('index'))

def logout_user(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))

@login_required
def profile(request):
    user = request.user
    context = {
        'user' : user,
    }
    return render(request, 'profile.html', context)
