from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from home.models import TestText, Test, TestResult

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

class EditProfileTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.username = 'johndoe'
        self.password = 'b3stp4ssw0rdEVER'
        self.user = self.User.objects.create_user(
            username=self.username, 
            password=self.password,
            email='johndoe@example.com'
        )
        self.edit_profile_url = reverse('accounts:edit_profile')

    def test_edit_profile_success(self):
        self.client.login(username=self.username, password=self.password)
        response = self.client.post(
            self.edit_profile_url, {
                'username': 'betterjohndoe', 
                'email': 'johnupdated@example.com'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.User.objects.filter(username='johndoe', email='johndoe@example.com').exists())
        self.assertEqual(self.user.username, 'betterjohndoe')
        self.assertEqual(self.user.email, 'johnupdated@example.com')

    def test_edit_profile_invalid_email(self):
        self.client.login(username=self.username, password=self.password)
        response = self.client.post(
            self.edit_profile_url, {
                'username': 'betterjohndoe', 
                'email': 'invalidemail'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'johndoe')
        self.assertEqual(self.user.email, 'johndoe@example.com')
    
    def test_edit_profile_username_already_exists(self):
        self.User.objects.create_user(username='ogjohndoe', password='someotherpassword', email='ogjohndoe@example.com')
        self.client.login(username=self.username, password=self.password)
        response = self.client.post(
            self.edit_profile_url, {
                'username': 'ogjohndoe', 
                'email': 'johndoe@example.com'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'johndoe')
        self.assertEqual(self.user.email, 'johndoe@example.com')

class ProfileDashboardTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.username = 'johndoe'
        self.password = 'b3stp4ssw0rdEVER'
        self.user = self.User.objects.create_user(
            username=self.username, 
            password=self.password,
            email='johndoe@example.com'
        )
        
        self.sample_text = TestText.objects.create(
            content="The quick brown fox jumps over the lazy dog.",
            difficulty="easy"
        )
        
        self.typing_test = Test.objects.create(
            text=self.sample_text,
            duration_seconds=60 
        )

        self.dashboard_url = reverse('accounts:profile_dashboard') 

    def test_dashboard_displays_correct_stats(self):
        self.client.login(username=self.username, password=self.password)

        TestResult.objects.create(
            user=self.user, 
            test=self.typing_test, 
            wpm=60.0, 
            accuracy=98.5
        )
        TestResult.objects.create(
            user=self.user, 
            test=self.typing_test, 
            wpm=65.0, 
            accuracy=99.0
        )

        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.status_code, 200)
        
        self.assertEqual(response.context['tests_count'], 2)

        self.assertEqual(response.context['total_time'], 120)

        self.assertContains(response, "Total Tests Taken: 2")
        self.assertContains(response, "Total Time Spent: 120")

    def test_dashboard_is_private(self):
        other_user = self.User.objects.create_user(username='hacker', password='password')

        TestResult.objects.create(
            user=other_user, 
            test=self.typing_test, 
            wpm=10.0, 
            accuracy=50.0
        )

        self.client.login(username=self.username, password=self.password)
        
        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.context['tests_count'], 0)
        self.assertEqual(response.context['total_time'], 0)

class OverallMetricsTests(TestCase):
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
        
        self.dashboard_url = reverse('accounts:profile_dashboard')
        
        self.text_easy = TestText.objects.create(
            content="The quick brown fox jumps over the lazy dog.", 
            difficulty="easy"
        )

        self.text_medium = TestText.objects.create(
            content="Walking through the park, she noticed the leaves were falling gently.", 
            difficulty="medium"
        )

        self.text_hard = TestText.objects.create(
            content="Despite the storm, the sailors navigated the treacherous waters with precision.", 
            difficulty="hard"
        )
   
        self.test_easy = Test.objects.create(text=self.text_easy, duration_seconds=15)
        self.test_medium = Test.objects.create(text=self.text_medium, duration_seconds=30)
        self.test_hard = Test.objects.create(text=self.text_hard, duration_seconds=60)

    def test_overall_metrics_calculation(self):
        TestResult.objects.create(user=self.user, test=self.test_easy, wpm=40, accuracy=90)
        TestResult.objects.create(user=self.user, test=self.test_easy, wpm=50, accuracy=95)
        TestResult.objects.create(user=self.user, test=self.test_medium, wpm=60, accuracy=85)
        TestResult.objects.create(user=self.user, test=self.test_hard, wpm=55, accuracy=80)
        
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 200)

        overall_metrics = response.context['overall_metrics']
        
        self.assertEqual(overall_metrics['highest_wpm'], 60)
        self.assertAlmostEqual(overall_metrics['average_wpm'], 51.25, places=2)
        
        self.assertEqual(overall_metrics['highest_accuracy'], 95)
        self.assertAlmostEqual(overall_metrics['average_accuracy'], 87.5, places=2)

    def test_overall_metrics_no_results(self):
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 200)

        overall_metrics = response.context['overall_metrics']
        
        self.assertIsNone(overall_metrics['highest_wpm'])
        self.assertIsNone(overall_metrics['average_wpm'])
        self.assertIsNone(overall_metrics['highest_accuracy'])
        self.assertIsNone(overall_metrics['average_accuracy'])