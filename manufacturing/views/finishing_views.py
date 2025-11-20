from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def finisher_dashboard(request):
    return render(request, 'dashboards/finisher_dashboard.html')


@login_required
def qa_engineer_dashboard(request):
    return render(request, 'dashboards/qa_engineer_dashboard.html')