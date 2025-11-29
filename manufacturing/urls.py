from django.urls import path
from .views import assembly_views, testing_views, painting_views, finishing_views

urlpatterns = [
    # Assembly URLs
    path('dashboard/assembly_engineer/', assembly_views.assembly_engineer_dashboard, name='assembly_engineer_dashboard'),
    path('dashboard/assembler/', assembly_views.assembler_dashboard, name='assembler_dashboard'),
    path('assembler/', assembly_views.assembler_dashboard, name='assembler_dashboard'),
    path('assembler/order/<str:order_no>/', assembly_views.assembler_order_details, name='assembler_order_details'),
    path('assembler/print-report/<str:order_no>/', assembly_views.print_order_report, name='print_order_report'),
    path("heat-report/<str:order_no>/", assembly_views.generate_heat_report, name="generate_heat_report"),
    
    # Testing URLs
    path('dashboard/tester/', testing_views.tester_dashboard, name='tester_dashboard'),
    
    # Painting URLs
    path('dashboard/painting_engineer/', painting_views.painting_engineer_dashboard, name='painting_engineer_dashboard'),
    path('dashboard/painter/', painting_views.painter_dashboard, name='painter_dashboard'),
    path('dashboard/blaster/', painting_views.blaster_dashboard, name='blaster_dashboard'),
    path('dashboard/name_plate_printer/', painting_views.name_plate_printer_dashboard, name='name_plate_printer_dashboard'),
    
    # Finishing URLs
    path('dashboard/finisher/', finishing_views.finisher_dashboard, name='finisher_dashboard'),
    path('dashboard/qa_engineer/', finishing_views.qa_engineer_dashboard, name='qa_engineer_dashboard'),
]