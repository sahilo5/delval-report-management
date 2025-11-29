from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from accounts.models import Profile
from accounts.forms import CustomUserCreationForm


# ================================================================
#  USER AUTHENTICATION
# ================================================================
def register_view(request):
    if request.method == 'POST':
        print("POST request received")
        print("POST data:", request.POST)
        
        form = CustomUserCreationForm(request.POST)
        print("Form created")
        
        if form.is_valid():
            print("Form is valid")
            # Save the user with first name and last name
            user = form.save()
            print(f"User created: {user.username}")
            
            login(request, user)
            messages.success(request, 'Registration successful!')
            return redirect('dashboard')
        else:
            # Debug form errors
            print("Form is invalid")
            print("Form errors:", form.errors)
            for field, errors in form.errors.items():
                print(f"Field {field}: {errors}")
    else:
        # For GET requests, create an empty form
        form = CustomUserCreationForm()
    
    return render(request, 'auth/register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Welcome back, {user.username}!')
            
            # Handle next parameter for redirect
            next_url = request.GET.get('next')
            if next_url and next_url.startswith('/'):
                return redirect(next_url)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password. Please try again.')
    else:
        form = AuthenticationForm()
    
    # Handle next parameter for GET requests
    next_url = request.GET.get('next', '')
    return render(request, 'auth/login.html', {'form': form, 'next_url': next_url})


@login_required
def logout_view(request):
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('login')


# ================================================================
#   ROLE-BASED DASHBOARD
# ================================================================
@login_required
def dashboard_view(request):
    try:
        role = request.user.profile.role
        # Map role names to URL names
        role_url_map = {
            'Assembly Engineer': 'assembly_engineer/',
            'Assembler': 'assembler/',
            'Tester': 'dashboard/tester/',
            'Painting Engineer': 'dashboard/painting_engineer/',
            'Painter': 'dashboard/painter/',
            'Blaster': 'dashboard/blaster/',
            'Name plate printer': 'dashboard/name_plate_printer/',
            'Finisher': 'dashboard/finisher/',
            'QA Engineer': 'dashboard/qa_engineer/',
        }
        
        # Get the URL for the role, default to assembler if not found
        dashboard_url = role_url_map.get(role, 'assembler/')
        return redirect(dashboard_url)
    except AttributeError:
        # Profile doesn't exist, create it
        Profile.objects.create(user=request.user)
        role = request.user.profile.role
        role_url_map = {
            'Assembly Engineer': 'dashboard/assembly_engineer/',
            'Assembler': 'assembler/',
            'Tester': 'dashboard/tester/',
            'Painting Engineer': 'dashboard/painting_engineer/',
            'Painter': 'dashboard/painter/',
            'Blaster': 'dashboard/blaster/',
            'Name plate printer': 'dashboard/name_plate_printer/',
            'Finisher': 'dashboard/finisher/',
            'QA Engineer': 'dashboard/qa_engineer/',
        }
        dashboard_url = role_url_map.get(role, 'assembler/')
        return redirect(dashboard_url)