from django.shortcuts import render

def get_test_text(request):
    # Sample texts 
    DIFFICULTY_TEXTS = {
        'easy': "The cat sat on the mat.",
        'medium': "The way you perceive the world and yourself has a profound impact on your reality.",
        'hard': "Time management is a critical skill for students who want to succeed in their academic pursuits."
    }

    selected_difficulty = request.GET.get('difficulty', 'easy')
    
    display_text = DIFFICULTY_TEXTS.get(selected_difficulty, DIFFICULTY_TEXTS['easy'])

    ctx = {
        'display_text': display_text,
        'difficulty': selected_difficulty,
    }
    
    return ctx

def home(request):
    ctx = {
        'test_text': get_test_text(request)
    }

    return render(request, 'home.html', ctx)
