from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class TestText(models.Model):
    content = models.TextField()
    difficulty = models.CharField(max_length=10, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ])

class Test(models.Model):
    text = models.ForeignKey(TestText, on_delete=models.CASCADE)
    duration_seconds = models.PositiveIntegerField() 
    created_at = models.DateTimeField(auto_now_add=True)

class TestResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    wpm = models.FloatField()
    accuracy = models.FloatField()
    
    mistyped_keys = models.JSONField(
        default=dict, 
    )

    wpm_history = models.JSONField(
        default=list, 
        blank=True, 
    )

    date_taken = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_taken']