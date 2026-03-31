from django.test import TestCase
from django.urls import reverse

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