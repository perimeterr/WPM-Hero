from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum, Max
from .forms import UserLoginForm, UserRegistrationForm, UserUpdateForm
from home.models import TestResult


def register(request):
   if request.method == "POST":
       form = UserRegistrationForm(request.POST)
       if form.is_valid():
           user = form.save()
           login(request, user)  
           return redirect('home:home') 
   else:
       form = UserRegistrationForm()
   return render(request, 'accounts/register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = UserLoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                next_url = request.GET.get('next') or 'home:home'
                return redirect(next_url)
            else:
                form.add_error(None, 'Invalid username or password')
    else:
        form = UserLoginForm()
    return render(request, 'accounts/login.html', {'form': form})

@login_required
def logout_view(request):
    logout(request)
    return redirect('accounts:login')

@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = UserUpdateForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, f'Your account has been updated!')
            return redirect('accounts:profile_dashboard') 
    else:
        form = UserUpdateForm(instance=request.user)

    return render(request, 'accounts/edit_profile.html', {'form': form})

@login_required
def profile_dashboard(request):
    test_results = TestResult.objects.filter(user=request.user)
    tests_count = test_results.count()

    time_data = TestResult.objects.filter(user=request.user).aggregate(
        total_time=Sum('test__duration_seconds')
    )

    actual_seconds = time_data['total_time'] or 0

    personal_records = (
        test_results
        .values('test__text__difficulty', 'test__duration_seconds')
        .annotate(best_wpm=Max('wpm'))
        .order_by('test__text__difficulty', 'test__duration_seconds')
    )

    ctx = {
        'tests_count': tests_count,
        'total_time': actual_seconds,
        'personal_records': personal_records
    }

    return render(request, 'accounts/profile_dashboard.html', ctx)