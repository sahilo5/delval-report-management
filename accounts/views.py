# This file has been refactored - views are now organized in separate modules:
# - accounts/views/auth_views.py - Authentication views
# - manufacturing/views/assembly_views.py - Assembly-related views  
# - manufacturing/views/testing_views.py - Testing dashboard
# - manufacturing/views/painting_views.py - Painting-related views
# - manufacturing/views/finishing_views.py - Finishing and QA views

# All URL routing is handled through:
# - accounts/urls.py (for authentication)
# - manufacturing/urls.py (for manufacturing functionality)