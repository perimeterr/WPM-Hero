from django.shortcuts import render
from .models import TestText

def get_test_text(request):
    selected_difficulty = request.GET.get('difficulty', 'easy')

    testtext = TestText.objects.filter(difficulty=selected_difficulty).order_by('?').first()

    if testtext is None:
        display_text = "No test text available. Please add some text in the admin panel."
    else:
        display_text = testtext.content

    ctx = {
        'display_text': display_text,
        'difficulty': selected_difficulty,
    }
    
    return ctx

def get_test_timer(request):
    TIMERS = {
        '15': 15,
        '30': 30,
        '60': 60,
    }

    selected_timer = request.GET.get('timer', '60')

    timer_value = TIMERS.get(selected_timer, TIMERS['60'])

    ctx = {
        'timer_value': timer_value,
        'selected_timer': selected_timer,
    }

    return ctx

def home(request):
    ctx = {
        'test_text': get_test_text(request),
        'test_timer': get_test_timer(request)           
    }

    return render(request, 'home.html', ctx)

def results(request):
    # Get the difficulty and timer from query parameters
    difficulty = request.GET.get('difficulty', 'easy')
    timer = request.GET.get('timer', '60')
    
    ctx = {
        'difficulty': difficulty,
        'timer': timer
    }
    
    return render(request, 'results.html', ctx)
