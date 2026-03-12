from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm


class UserRegistrationForm(UserCreationForm):
   email = forms.EmailField(required=True)

   class Meta:
       model = User
       fields = ('username', 'email', 'password1', 'password2')

class UserLoginForm(forms.Form):
   username = forms.CharField(max_length=150)
   password = forms.CharField(widget=forms.PasswordInput)

class UserUpdateForm(forms.ModelForm):
   class Meta:
      model = User
      fields = ['username', 'email']