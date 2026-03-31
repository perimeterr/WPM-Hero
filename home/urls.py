from django.urls import path

from .views import home, results, save_result

app_name = 'home'

urlpatterns = [
    path('', home, name='home'),
    path('results/', results, name='results'),
    path('save-result/', save_result, name='save_result'),
]

