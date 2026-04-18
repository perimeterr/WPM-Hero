from django.shortcuts import render, redirect
import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from .models import TestText, Test, TestResult

def get_test_text(request):
    selected_difficulty = request.GET.get('difficulty', 'easy')

    test_texts = TestText.objects.filter(difficulty=selected_difficulty, created_by__isnull=True)
    all_custom_texts = None
    custom_text = None

    if request.user.is_authenticated:
        all_custom_texts = TestText.objects.filter(difficulty=selected_difficulty, created_by=request.user)
        custom_text = request.GET.get('custom-text')
    
    if test_texts:
        testtext = test_texts.order_by('?').first()
    else:
        testtext = None

    if testtext is None:
        display_text = "No test text available. Please add some text in the admin panel."
        request.session.pop('current_test_text_id', None)
    else:
        display_text = testtext.content
        request.session['current_test_text_id'] = testtext.id
    
    if custom_text != None and custom_text != "":
        display_text = TestText.objects.get(id=custom_text).content

    ctx = {
        'display_text': display_text,
        'difficulty': selected_difficulty,
        'all_custom_texts': all_custom_texts
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

@login_required
def customtext(request):
    if request.method == 'POST':
        content = request.POST.get('content')
        difficulty = request.POST.get('difficulty', 'easy')

        if content:
            word_count = len(content.split())

            if word_count < 60:
                return render(request, 'customtext.html', {
                    'error': 'Text must be at least 60 words.',
                    'content': content,
                    'difficulty': difficulty
                })
            
            if word_count > 600:
                return render(request, 'customtext.html', {
                    'error': 'Text must not exceed 600 words.',
                    'content': content,
                    'difficulty': difficulty
                })
        
            TestText.objects.create(
                content=content,
                difficulty=difficulty,
                created_by=request.user,
            )
            return redirect('home:home')
        
    
    else:
        content = ''
        difficulty = 'easy'

    return render(request, 'customtext.html', {
        'content': content,
        'difficulty': difficulty
    })

@require_POST
def save_result(request):
    print("save_result view was called")
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'User not logged in'}, status=401)

    try:
        data = json.loads(request.body)

        timer = int(data.get('timer'))
        wpm = float(data.get('wpm'))
        accuracy = float(data.get('accuracy'))
        mistyped_keys = data.get('mistyped_keys', {})

        test_text_id = request.session.get('current_test_text_id')

        if test_text_id is not None:
            test_text = TestText.objects.filter(id=test_text_id).first()

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