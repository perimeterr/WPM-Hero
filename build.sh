#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python -c "import django; import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings'); django.setup(); from django.conf import settings; print('STATIC_ROOT:', settings.STATIC_ROOT)"
python manage.py collectstatic --no-input
python manage.py migrate