from django.shortcuts import render, redirect
import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from .models import TestText, Test, TestResult

def home(request):
    easy_texts = list(TestText.objects.filter(difficulty='easy', created_by__isnull=True).values('id', 'content'))
    medium_texts = list(TestText.objects.filter(difficulty='medium', created_by__isnull=True).values('id', 'content'))
    hard_texts = list(TestText.objects.filter(difficulty='hard', created_by__isnull=True).values('id', 'content'))
    custom_texts = list(TestText.objects.filter(created_by=request.user).values('id', 'content', 'difficulty')) if request.user.is_authenticated else []

    ctx = {
        'all_texts': {
            'easy': easy_texts,
            'medium': medium_texts,
            'hard': hard_texts
        },
        'custom_texts': custom_texts
    }
    return render(request, 'home.html', ctx)

def results(request):
    difficulty = request.GET.get('difficulty', 'easy')
    timer = request.GET.get('timer', '60')
    ctx = {
        'difficulty': difficulty,
        'timer': timer,
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
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'User not logged in'}, status=401)
    try:
        data = json.loads(request.body)
        timer = int(data.get('timer'))
        wpm = float(data.get('wpm'))
        accuracy = float(data.get('accuracy'))
        difficulty = data.get('difficulty', 'easy')
        mistyped_keys = data.get('mistyped_keys', {})
        correct_keys = data.get('correct_keys', {})

        test_text = TestText.objects.filter(
            difficulty=difficulty, created_by__isnull=True
        ).order_by('?').first()

        if not test_text:
            return JsonResponse({'success': False, 'message': 'No text found'}, status=400)

        test = Test.objects.create(text=test_text, duration_seconds=timer)
        TestResult.objects.create(
            user=request.user,
            test=test,
            wpm=wpm,
            accuracy=accuracy,
            mistyped_keys=mistyped_keys,
            correct_keys=correct_keys
        )
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)