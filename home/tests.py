from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Test, TestResult, TestText

class PageRedirectTests(TestCase):
    def test_home_page_redirect(self):
        response = self.client.get(reverse('home:home'))
        self.assertEqual(response.status_code, 200)

    def test_results_page_redirect(self):
        response = self.client.get(reverse('home:results'))
        self.assertEqual(response.status_code, 200)

class CustomTextTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.username = 'johndoe'
        self.password = 'b3stp4ssw0rdEVER'
        self.user = self.User.objects.create_user(
            username=self.username, 
            password=self.password,
            email='johndoe@example.com'
        )
        self.client.login(username=self.username, password=self.password)

    def test_customtext_requires_login(self):
        self.client.logout()
        response = self.client.get(reverse('home:customtext'))
        self.assertEqual(response.status_code, 302)

    def test_customtext_rejects_too_short_input(self):
        response = self.client.post(
            reverse('home:customtext'),
            {
                'content': 'too short',
                'difficulty': 'easy',
            }
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Text must be at least 60 words.')
        self.assertEqual(TestText.objects.count(), 0)

    def test_customtext_accepts_valid_input(self):
        valid_text = 'word ' * 60
        response = self.client.post(
            reverse('home:customtext'),
            {
                'content': valid_text.strip(),
                'difficulty': 'medium',
            }
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse('home:home'))
        self.assertEqual(TestText.objects.count(), 1)

        created_text = TestText.objects.first()
        self.assertEqual(created_text.difficulty, 'medium')
        self.assertEqual(created_text.created_by, self.user)

    def test_customtext_only_appears_per_user(self):
        valid_text = 'word ' * 60
        self.client.post(
            reverse('home:customtext'),
            {
                'content': valid_text.strip(),
                'difficulty': 'medium',
            }
        )

        self.client.logout()
        self.User.objects.create_user(
            username='janedoe', 
            password='an0therb3stp4ssw0rd',
            email='janedoe@example.com'
        )
        self.client.login(
            username='janedoe',
            password='an0therb3stp4ssw0rd'
        )
        self.client.get(reverse('home:home'), {'difficulty': 'medium'})
        self.assertNotContains(self.client.get(reverse('home:home')), valid_text.strip())

class WebsiteIntegrationTests(TestCase):
    def test_home_page_contains_difficulty_options(self):
        response = self.client.get(reverse('home:home'))
        self.assertContains(response, 'value="easy"')
        self.assertContains(response, 'value="medium"')
        self.assertContains(response, 'value="hard"')

    def test_home_page_contains_timer_options(self):
        response = self.client.get(reverse('home:home'))
        self.assertContains(response, 'value="15"')
        self.assertContains(response, 'value="30"')
        self.assertContains(response, 'value="60"')