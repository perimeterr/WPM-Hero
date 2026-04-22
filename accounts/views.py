from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum, Max, Avg
from django.utils import timezone
from datetime import timedelta
from collections import Counter
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
            messages.success(request, 'Your account has been updated!')
            return redirect('accounts:profile_dashboard') 
    else:
        form = UserUpdateForm(instance=request.user)

    return render(request, 'accounts/edit_profile.html', {'form': form})

@login_required
def profile_dashboard(request):
    test_results = TestResult.objects.filter(user=request.user)
    tests_count = test_results.count()

    DEFAULT_FILTER_DAYS = '30'
    chart_filter = request.GET.get('filter', DEFAULT_FILTER_DAYS)
    allowed_ = {'1', '7', '30', '90', '180', '365', 'all'}
    if chart_filter not in allowed_:
        chart_filter = DEFAULT_FILTER_DAYS

    chart_results = test_results
    if chart_filter != 'all':
        days = int(chart_filter)
        cutoff = timezone.now() - timedelta(days=days)
        chart_results = test_results.filter(date_taken__gte=cutoff)

    time_data = TestResult.objects.filter(user=request.user).aggregate(
        total_time=Sum('test__duration_seconds')
    )

    actual_time = time_data['total_time']

    last_test = test_results.order_by('-date_taken').first()

    personal_records = (
        test_results
        .values('test__text__difficulty', 'test__duration_seconds')
        .annotate(best_wpm=Max('wpm'))
        .order_by('test__text__difficulty', 'test__duration_seconds')
    )

    overall_metrics = test_results.aggregate(
        highest_wpm=Max('wpm'),
        average_wpm=Avg('wpm'),
        highest_accuracy=Max('accuracy'),
        average_accuracy=Avg('accuracy')
    )

    all_mistypes = test_results.values_list('mistyped_keys', flat=True)
    all_corrects = test_results.values_list('correct_keys', flat=True)

    global_mistypes = Counter()
    global_corrects = Counter()

    for entry in all_mistypes:
        if entry:
            global_mistypes.update(entry)

    for entry in all_corrects:
        if entry:
            global_corrects.update(entry)

    error_data = {}
    for key in global_mistypes:
        wrong   = global_mistypes[key]
        correct = global_corrects.get(key, 0)
        total   = wrong + correct
        if total > 0:
            error_data[key] = round((wrong / total) * 100, 1)

    chronological_chart_results = chart_results.order_by('date_taken')
    progress_data_dates = []
    for result in chronological_chart_results:
        progress_data_dates.append(
            timezone.localtime(result.date_taken).strftime('%b %d, %Y - %I:%M %p')
        )
    progress_data_wpm = list(chronological_chart_results.values_list('wpm', flat=True))

    ctx = {
        'tests_count': tests_count,
        'total_time': actual_time,
        'personal_records': personal_records,
        'overall_metrics': overall_metrics,
        'progress_data_dates': progress_data_dates,
        'progress_data_wpm': progress_data_wpm,
        'selected_chart_filter': chart_filter,
        'last_test': last_test,
        'error_data': error_data
    }

    return render(request, 'accounts/profile_dashboard.html', ctx)