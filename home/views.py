from django.shortcuts import render
import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import TestText, Test, TestResult

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
    previous_results = []
    if request.user.is_authenticated:
        previous_results = TestResult.objects.filter(user=request.user).select_related('test', 'test__text')[:10]

    ctx = {
        'difficulty': difficulty,
        'timer': timer,
        'is_logged_in': request.user.is_authenticated,
        'previous_results': previous_results,
    }
    
    return render(request, 'results.html', ctx)


@require_POST
def save_result(request):
    print("save_result view was called")
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'User not logged in'}, status=401)

    try:
        data = json.loads(request.body)

        difficulty = data.get('difficulty')
        timer = int(data.get('timer'))
        wpm = float(data.get('wpm'))
        accuracy = float(data.get('accuracy'))
        mistyped_keys = data.get('mistyped_keys', {})

        test_text = TestText.objects.filter(difficulty=difficulty).first()
        if not test_text:
            return JsonResponse({'success': False, 'message': 'No sample text found for this difficulty'}, status=400)

        test = Test.objects.create(
            text=test_text,
            duration_seconds=timer
        )

        TestResult.objects.create(
            user=request.user,
            test=test,
            wpm=wpm,
            accuracy=accuracy,
            mistyped_keys=mistyped_keys
        )

        return JsonResponse({'success': True})

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)