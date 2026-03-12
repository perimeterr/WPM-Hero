from django.contrib import admin
from .models import TestText, Test, TestResult


class TestTextAdmin(admin.ModelAdmin):
    model = TestText
    list_display = ('id', 'difficulty', 'content')


class TestAdmin(admin.ModelAdmin):
    model = Test
    list_display = ('id', 'text', 'duration_seconds', 'created_at')


class TestResultAdmin(admin.ModelAdmin):
    model = TestResult
    list_display = ('id', 'user', 'test', 'wpm', 'accuracy', 'date_taken')


admin.site.register(TestText, TestTextAdmin)
admin.site.register(Test, TestAdmin)
admin.site.register(TestResult, TestResultAdmin)