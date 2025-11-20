from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def tester_dashboard(request):
    return render(request, 'dashboards/tester_dashboard.html')