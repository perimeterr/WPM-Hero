from django.contrib import admin
from .models import TestText

# Register your models here.
class TestTextAdmin(admin.ModelAdmin):
    model = TestText

admin.site.register(TestText, TestTextAdmin)