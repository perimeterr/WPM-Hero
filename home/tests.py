from django.test import TestCase
from .models import TestText
from django.urls import reverse

# Create your tests here.
class TestTextTests(TestCase):
    def setUp(self):
        TestText.objects.create(content="Easy test text", difficulty="easy")
        TestText.objects.create(content="Medium test text", difficulty="medium")
        TestText.objects.create(content="Hard test text", difficulty="hard")

    def test_get_test_text_easy(self):
        response = self.client.get(reverse('home:home') + '?difficulty=easy')
        self.assertContains(response, "Easy test text")

    def test_get_test_text_medium(self):
        response = self.client.get(reverse('home:home') + '?difficulty=medium')
        self.assertContains(response, "Medium test text")

    def test_get_test_text_hard(self):
        response = self.client.get(reverse('home:home') + '?difficulty=hard')
        self.assertContains(response, "Hard test text")

    def test_get_test_text_no_text(self):
        TestText.objects.all().delete()
        response = self.client.get(reverse('home:home') + '?difficulty=easy')
        self.assertContains(response, "No test text available. Please add some text in the admin panel.")

class PageRedirectTests(TestCase):
    def test_home_page_redirect(self):
        response = self.client.get(reverse('home:home'))
        self.assertEqual(response.status_code, 200)

    def test_results_page_redirect(self):
        response = self.client.get(reverse('home:results'))
        self.assertEqual(response.status_code, 200)

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

    

