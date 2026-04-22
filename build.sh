#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python -c "
import os, sys
sys.path.insert(0, '.')
settings_module = os.environ.get('DJANGO_SETTINGS_MODULE', 'not set')
print('Settings module:', settings_module)
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
django.setup()
from django.conf import settings
print('STATIC_ROOT:', repr(settings.STATIC_ROOT))
print('BASE_DIR:', repr(getattr(settings, 'BASE_DIR', 'NOT FOUND')))
"
python manage.py collectstatic --no-input
python manage.py migrate