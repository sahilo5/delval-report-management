from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def painting_engineer_dashboard(request):
    return render(request, 'dashboards/painting_engineer_dashboard.html')


@login_required
def painter_dashboard(request):
    return render(request, 'dashboards/painter_dashboard.html')


@login_required
def blaster_dashboard(request):
    return render(request, 'dashboards/blaster_dashboard.html')


@login_required
def name_plate_printer_dashboard(request):
    return render(request, 'dashboards/name_plate_printer_dashboard.html')