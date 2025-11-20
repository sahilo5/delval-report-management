# Report Management System

A manufacturing workflow management system for Delval Flow Controls Private Limited that tracks the production process of actuators through various stages including assembly, testing, painting, finishing, and quality assurance.

## Features

- Role-based dashboards for different manufacturing personnel
- Order tracking and management
- Heat number traceability for quality control
- PDF report generation for compliance
- Production workflow monitoring

## Tech Stack

- **Backend**: Django 5.0.3
- **Database**: PostgreSQL
- **Frontend**: Tailwind CSS
- **PDF Generation**: ReportLab
- **Deployment**: Gunicorn

## User Roles

- Assembly Engineer
- Assembler
- Tester
- Painting Engineer
- Painter
- Blaster
- Name Plate Printer
- Finisher
- QA Engineer

## Installation

1. Clone the repository
2. Create a virtual environment
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables for database configuration
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```
7. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Usage

1. Register an account with appropriate role
2. Log in to access your role-specific dashboard
3. Follow the workflow based on your role in the manufacturing process

## License

© 2023 Report Management. All rights reserved.