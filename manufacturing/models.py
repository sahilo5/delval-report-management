from django.db import models
from django.contrib.auth.models import User


class MainActuator(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_assembly', 'Under Assembly'),
        ('under_testing', 'Under Testing'),
        ('under_painting', 'Under Painting'),
        ('under_finishing', 'Under Finishing'),
        ('under_qa', 'Under QA'),
        ('finished_goods', 'Finished goods'),
    ]

    sales_order_no =  models.CharField(max_length=50)
    line_item = models.CharField(max_length=50)
    order_no = models.CharField(max_length=50, unique=True)
    customer = models.CharField(max_length=100)
    series = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    size = models.CharField(max_length=50)
    cylinder_size = models.CharField(max_length=50, help_text="Cylinder size in inch")
    spring_size = models.CharField(max_length=50, blank=True, null=True)
    moc = models.CharField(max_length=50, help_text="Material of Construction")
    order_qty = models.CharField(max_length=50, default="0")
    order_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    item_code = models.CharField(max_length=50)
    creation_date = models.DateTimeField()
    branch = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return f"{self.order_no} - {self.item_code}"


class OrderDetails(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]

    order_no = models.ForeignKey(MainActuator, on_delete=models.CASCADE, related_name='order_details')
    assembler_status = models.CharField(max_length=20, choices=STATUS_CHOICES, blank=True, null=True, default='pending')
    actuator_serial_no = models.CharField(max_length=100, unique=True)
    assembler_name = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    housing_heat_no = models.CharField(max_length=100, blank=True, null=True)
    yoke_heat_no = models.CharField(max_length=100, blank=True, null=True)
    top_cover_heat_no = models.CharField(max_length=100, blank=True, null=True)
    da_side_adaptor_plate_heat_no = models.CharField(max_length=100, blank=True, null=True)
    spring_side_adaptor_heat_no = models.CharField(max_length=100, blank=True, null=True)
    da_side_end_plate_heat_no = models.CharField(max_length=100, blank=True, null=True)
    spring_side_end_plate_heat_no = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.actuator_serial_no} - {self.order_no.order_no}"
