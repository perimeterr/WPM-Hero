from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from home.models import TestText, Test, TestResult
from django.utils import timezone
from datetime import timedelta

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
        response = self.client.post(
            self.login_url, {
                'username': 'johndoestwin', 
                'password': self.password
            }, 
            follow=True
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.context['user'].is_authenticated)

    def test_wrong_password_login_failure(self):
        response = self.client.post(
            self.login_url, {
                'username': self.username, 
                'password': 'wrongpassword'
            }, 
            follow=True
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.context['user'].is_authenticated)

    def test_logout_success(self):
        self.client.login(
            username=self.username, 
            password=self.password
        )
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
        self.client.login(
            username=self.username, 
            password=self.password
        )
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
        self.assertEqual(response.status_code, 302)
        self.user.refresh_from_db()
        self.assertFalse(self.User.objects.filter(
            username='johndoe', 
            email='johndoe@example.com').exists()
        )
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
        self.User.objects.create_user(
            username='ogjohndoe', 
            password='someotherpassword', 
            email='ogjohndoe@example.com'
        )
        self.client.login(
            username=self.username, 
            password=self.password
        )
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

        self.assertEqual(response.context['tests_count'], 2)
        self.assertEqual(response.context['total_time'] or 0, 120)

        self.assertContains(response, "Tests Taken")
        self.assertContains(response, "2")

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

        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.context['tests_count'], 0)
        self.assertEqual(response.context['total_time'] or 0, 0)

class PersonalRecordsTests(TestCase):
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

        self.easy_text = TestText.objects.create(
            content="easy text " * 20,
            difficulty="easy"
        )

        self.medium_text = TestText.objects.create(
            content="medium text " * 20,
            difficulty="medium"
        )

        self.test_60_easy = Test.objects.create(text=self.easy_text, duration_seconds=60)
        self.test_60_medium = Test.objects.create(text=self.medium_text, duration_seconds=60)

        self.dashboard_url = reverse('accounts:profile_dashboard')

    def test_personal_records_grouped_by_difficulty_and_timer(self):
        TestResult.objects.create(
            user=self.user,
            test=self.test_60_easy,
            wpm=40,
            accuracy=90
        )

        TestResult.objects.create(
            user=self.user,
            test=self.test_60_easy,
            wpm=55,  
            accuracy=95
        )

        TestResult.objects.create(
            user=self.user,
            test=self.test_60_medium,
            wpm=60,
            accuracy=85
        )

        TestResult.objects.create(
            user=self.user,
            test=self.test_60_medium,
            wpm=70,  
            accuracy=88
        )

        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.status_code, 200)

        personal_records = response.context['personal_records']

        records = list(personal_records)

        easy_record = next(
            r for r in records
            if r['test__text__difficulty'] == 'easy'
        )
        self.assertEqual(easy_record['best_wpm'], 55)

        medium_record = next(
            r for r in records
            if r['test__text__difficulty'] == 'medium'
        )
        self.assertEqual(medium_record['best_wpm'], 70)

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

class ProgressVisualizationTests(TestCase):
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

        self.sample_text = TestText.objects.create(
            content="The quick brown fox jumps over the lazy dog.",
            difficulty="easy"
        )
        
        self.typing_test = Test.objects.create(
            text=self.sample_text,
            duration_seconds=60 
        )

        self.dashboard_url = reverse('accounts:profile_dashboard')

    def _create_test_results_with_various_dates(self):
        # Sample Test Result with current date and time
        sample_a = TestResult.objects.create(user=self.user, test=self.typing_test, wpm=40, accuracy=90)
        sample_a.date_taken = timezone.now()
        sample_a.save()

        # Sample Test Result from 1 hour ago
        sample_b = TestResult.objects.create(user=self.user, test=self.typing_test, wpm=50, accuracy=95)
        sample_b.date_taken = timezone.now() - timedelta(hours=1)
        sample_b.save()

        # Sample Test Result from 5 days ago
        sample_c = TestResult.objects.create(user=self.user, test=self.typing_test, wpm=60, accuracy=85)
        sample_c.date_taken = timezone.now() - timedelta(days=5)
        sample_c.save()

        # Sample Test Result from 8 days ago
        sample_d = TestResult.objects.create(user=self.user, test=self.typing_test, wpm=70, accuracy=80)
        sample_d.date_taken = timezone.now() - timedelta(days=8)
        sample_d.save()

        # Sample Test Result from 32 days ago
        sample_e = TestResult.objects.create(user=self.user, test=self.typing_test, wpm=80, accuracy=75)
        sample_e.date_taken = timezone.now() - timedelta(days=32)
        sample_e.save()

        # Sample Test Result from 95 days ago
        sample_f = TestResult.objects.create(user=self.user, test=self.typing_test, wpm=90, accuracy=70)
        sample_f.date_taken = timezone.now() - timedelta(days=95)
        sample_f.save()

        # Sample Test Result from 185 days ago
        sample_g = TestResult.objects.create(user=self.user, test=self.typing_test, wpm=100, accuracy=65)
        sample_g.date_taken = timezone.now() - timedelta(days=185)
        sample_g.save()

        # Sample Test Result from 364 days ago
        sample_h = TestResult.objects.create(user=self.user, test=self.typing_test, wpm=110, accuracy=60)
        sample_h.date_taken = timezone.now() - timedelta(days=364)
        sample_h.save()

        # Sample Test Result from 400 days ago
        sample_i = TestResult.objects.create(user=self.user, test=self.typing_test, wpm=120, accuracy=55)
        sample_i.date_taken = timezone.now() - timedelta(days=400)
        sample_i.save()

    def test_progress_visualization_with_24_hour_filter(self):
        self._create_test_results_with_various_dates()

        response = self.client.get(self.dashboard_url + '?filter=1')
        self.assertEqual(response.status_code, 200)

        progress_data_wpm = response.context['progress_data_wpm']
        self.assertEqual(len(progress_data_wpm), 2)
        self.assertEqual(progress_data_wpm, [50.0, 40.0])

    def test_progress_visualization_with_7_day_filter(self):
        self._create_test_results_with_various_dates()
        
        response = self.client.get(self.dashboard_url + '?filter=7')
        self.assertEqual(response.status_code, 200)

        progress_data_wpm = response.context['progress_data_wpm']
        self.assertEqual(len(progress_data_wpm), 3)
        self.assertEqual(progress_data_wpm, [60.0, 50.0, 40.0])

    def test_progress_visualization_with_30_day_filter(self):
        self._create_test_results_with_various_dates()

        response = self.client.get(self.dashboard_url + '?filter=30')
        self.assertEqual(response.status_code, 200)

        progress_data_wpm = response.context['progress_data_wpm']
        self.assertEqual(len(progress_data_wpm), 4)
        self.assertEqual(progress_data_wpm, [70.0, 60.0, 50.0, 40.0])

    def test_progress_visualization_with_90_day_filter(self):
        self._create_test_results_with_various_dates()

        response = self.client.get(self.dashboard_url + '?filter=90')
        self.assertEqual(response.status_code, 200)

        progress_data_wpm = response.context['progress_data_wpm']
        self.assertEqual(len(progress_data_wpm), 5)
        self.assertEqual(progress_data_wpm, [80.0, 70.0, 60.0, 50.0, 40.0])

    def test_progress_visualization_with_180_day_filter(self):
        self._create_test_results_with_various_dates()

        response = self.client.get(self.dashboard_url + '?filter=180')
        self.assertEqual(response.status_code, 200)

        progress_data_wpm = response.context['progress_data_wpm']
        self.assertEqual(len(progress_data_wpm), 6)
        self.assertEqual(progress_data_wpm, [90.0, 80.0, 70.0, 60.0, 50.0, 40.0])

    def test_progress_visualization_with_365_day_filter(self):
        self._create_test_results_with_various_dates()

        response = self.client.get(self.dashboard_url + '?filter=365')
        self.assertEqual(response.status_code, 200)

        progress_data_wpm = response.context['progress_data_wpm']
        self.assertEqual(len(progress_data_wpm), 8)
        self.assertEqual(progress_data_wpm, [110.0, 100.0, 90.0, 80.0, 70.0, 60.0, 50.0, 40.0])
    def test_progress_visualization_with_all_time_filter(self):
        self._create_test_results_with_various_dates()

        response = self.client.get(self.dashboard_url + '?filter=all')
        self.assertEqual(response.status_code, 200)

        progress_data_wpm = response.context['progress_data_wpm']
        self.assertEqual(len(progress_data_wpm), 9)
        self.assertEqual(progress_data_wpm, [120.0, 110.0, 100.0, 90.0, 80.0, 70.0, 60.0, 50.0, 40.0])