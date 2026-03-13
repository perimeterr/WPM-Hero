from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

class AccountRegistrationTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.registration_url = reverse('accounts:register')

    def test_registration_success(self):
        response = self.client.post(
            self.registration_url, {
                'username': 'johndoe', 
                'email': 'johndoe@example.com',
                'password1': 'b3stp4ssw0rdEVER',
                'password2': 'b3stp4ssw0rdEVER'
            }
        )
        self.assertRedirects(response, reverse('home:home'))
        self.assertTrue(self.User.objects.filter(username='johndoe').exists())

    def test_registration_password_mismatch(self):
        response = self.client.post(
            self.registration_url, {
                'username': 'johndoe', 
                'email': 'johndoe@example.com',
                'password1': 'b3stp4ssw0rdEVER',
                'password2': 'differentpassword'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(self.User.objects.filter(username='johndoe').exists())

    def test_registration_missing_username(self):
        response = self.client.post(
            self.registration_url, {
                'email': 'johndoe@example.com',
                'password1': 'b3stp4ssw0rdEVER',
                'password2': 'b3stp4ssw0rdEVER'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(self.User.objects.filter(username='johndoe').exists())
    
    def test_registration_missing_email(self):
        response = self.client.post(
            self.registration_url, {
                'username': 'johndoe', 
                'password1': 'b3stp4ssw0rdEVER',
                'password2': 'b3stp4ssw0rdEVER'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(self.User.objects.filter(username='johndoe').exists())

    def test_registration_short_password(self):
        response = self.client.post(
            self.registration_url, {
                'username': 'johndoe', 
                'email': 'johndoe@example.com',
                'password1': '123',
                'password2': '123'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(self.User.objects.filter(username='johndoe').exists())

    def test_registration_failure_weak_password(self):
        response = self.client.post(
            self.registration_url, {
                'username': 'johndoe', 
                'email': 'johndoe@example.com',
                'password1': 'password',
                'password2': 'password'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(self.User.objects.filter(username='johndoe').exists())

    def test_registration_username_already_exists(self):
        self.User.objects.create_user(username='johndoe', email='johndoe@example.com', password='b3stp4ssw0rdEVER')
        response = self.client.post(
            self.registration_url, {
                'username': 'johndoe', 
                'email': 'johndoe2@example.com',
                'password1': 'b3stp4ssw0rdEVER',
                'password2': 'b3stp4ssw0rdEVER'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.User.objects.filter(username='johndoe').exists())


class AccountLoginTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.username = 'johndoe'
        self.password = 'b3stp4ssw0rdEVER'
        self.user = self.User.objects.create_user(
            username=self.username, 
            password=self.password, 
            email='test@example.com'
        )
        self.login_url = reverse('accounts:login')
        self.logout_url = reverse('accounts:logout')

    def test_login_success(self):
        response = self.client.post(
            self.login_url, {
                'username': self.username, 
                'password': self.password
            }, 
            follow=True
        )
        self.assertRedirects(response, reverse('home:home'))
        self.assertTrue(response.context['user'].is_authenticated)

    def test_invalid_user_login_failure(self):
        response = self.client.post(self.login_url, {'username': 'johndoestwin', 'password': self.password}, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.context['user'].is_authenticated)

    def test_wrong_password_login_failure(self):
        response = self.client.post(self.login_url, {'username': self.username, 'password': 'wrongpassword'}, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.context['user'].is_authenticated)

    def test_logout_success(self):
        self.client.login(username=self.username, password=self.password)
        response = self.client.post(self.logout_url, follow=True)
        self.assertRedirects(response, reverse('home:home'))
        self.assertFalse(response.context['user'].is_authenticated)

class AccountLogoutTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.username = 'johndoe'
        self.password = 'b3stp4ssw0rdEVER'
        self.user = self.User.objects.create_user(
            username=self.username, 
            password=self.password,
            email='johndoe@example.com'
        )
        self.logout_url = reverse('accounts:logout')

    def test_logout_success(self):
        self.client.login(username=self.username, password=self.password)
        response = self.client.post(self.logout_url, follow=True)
        self.assertRedirects(response, reverse('home:home'))
        self.assertFalse(response.context['user'].is_authenticated)
