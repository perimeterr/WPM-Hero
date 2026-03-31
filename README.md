### Project Setup Guide
## 1. Create a Virtual Environment
Create a Python Virtual environment:
```python -m venv env```

Activate the virtual environment:<br/>
Windows:
```env\Scripts\activate```

macOs/Linux:
```source env/bin/activate```

## 2. Install Project Dependencies
Install the required Python packages:
```pip install -r requirements.txt```

## 3. Configure Environment Variables
Create your own .env file based on .env.example.

Example stucture:
```
SECRET_KEY=your_django_secret_key
DB_NAME=wpm_hero
DB_USER=your_database_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

## 4. Create PostgreSQL Database and User
Open the PostgreSQL CLI:
```psql -U postgres```

Create a database:
```CREATE DATABASE wpm_hero;```

Create a user:
```CREATE USER your_database_user WITH PASSWORD 'your_password';```

```
ALTER ROLE your_database_user SET client_encoding TO 'utf8';
ALTER ROLE your_database_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE wpm_hero TO your_database_user;
```

Exit PostgreSQL:
```\q```

## 5. Apply Django Migrations
Run database migrations:
```python manage.py migrate```

## 6. Run the Development Server
```python manage.py runserver```

The application should now be available at http://127.0.0.1:8000/


