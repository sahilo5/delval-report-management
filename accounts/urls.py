from django.urls import path, include
from .views import auth_views

urlpatterns = [
    path('', auth_views.login_view, name='login'),
    path('register/', auth_views.register_view, name='register'),
    path('logout/', auth_views.logout_view, name='logout'),
    path('dashboard/', auth_views.dashboard_view, name='dashboard'),
    
    # Include manufacturing URLs for all dashboard functionality
    path('', include('manufacturing.urls')),
]
