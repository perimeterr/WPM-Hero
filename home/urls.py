from django.urls import path

from .views import home, results

app_name = 'home'

urlpatterns = [
    path('', home, name='home'),
    path('results/', results, name='results'),
]

