from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import models
from django.db.models import IntegerField, Q
from django.db.models.functions import Cast, Substr
from django.http import HttpResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from datetime import datetime
import json

from ..models import MainActuator, OrderDetails_25_Series, OrderDetails_21_Series

from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm


# ================================================================
#   ASSEMBLY ENGINEER – QR INSERT LOGIC
# ================================================================
@login_required
def assembly_engineer_dashboard(request):
    """
    Accepts POSTed JSON in 'actuator_data' (hidden input).
    The JSON can come from QR scan (scanned payload) or manual entry.
    """

    if request.method == "POST":
        # parse posted actuator JSON
        raw = request.POST.get("actuator_data", "") or request.POST.dict()
        data = None
        try:
            # If actuator_data is a JSON string, parse it
            if isinstance(raw, str) and raw.strip():
                data = json.loads(raw)  # <-- This line needs 'import json'
            elif isinstance(raw, dict):
                # some browsers may send form dict; try to extract known keys
                data = {k: v for k, v in raw.items()}
            else:
                data = {}
        except Exception as e:
            messages.error(request, f"Invalid actuator data JSON: {e}")
            return redirect("assembly_engineer_dashboard")

        # Normalize keys - prefer snake_case keys expected by the form
        def get(d, *keys):
            for k in keys:
                if k in d and d[k] not in (None, ""):
                    return d[k]
            return ""

        order_no = get(data, "order_no", "order no", "orderno")
        sales_order_no = get(data, "sales_order_no", "sales order no", "salesorder")
        order_qty = get(data, "order_qty", "order qty", "qty", "quantity") or "1"

        if not order_no or not sales_order_no:
            messages.error(request, "Order No and Sales Order No are required.")
            return redirect("assembly_engineer_dashboard")

        # duplicate check
        if MainActuator.objects.filter(order_no=order_no).exists():
            messages.error(request, f"Order {order_no} already exists.")
            return redirect("assembly_engineer_dashboard")

        # Create MainActuator record (fill missing keys with empty string)
        try:
            actuator = MainActuator.objects.create(
                sales_order_no = sales_order_no,
                order_no = order_no,
                line_item = get(data, "line_item", "line item"),
                order_qty = order_qty,
                series = get(data, "series"),
                type = get(data, "type"),
                size = get(data, "size"),
                cylinder_size = get(data, "cylinder_size", "cylinder size"),
                spring_size = get(data, "spring_size", "spring size"),
                moc = get(data, "moc"),
                customer = get(data, "customer"),
                item_code = get(data, "item_code", "item code"),
                creation_date = get(data, "creation_date"),
                branch = get(data, "branch"),
                order_status = "under_assembly"
            )
        except Exception as e:
            messages.error(request, f"Failed to create actuator: {e}")
            return redirect("assembly_engineer_dashboard")

        # Create OrderDetails serials based on series
        try:
            qty = int(order_qty)
        except:
            qty = 1

        series = get(data, "series")
        
        if series == "25":
            # Create OrderDetails_25_Series entries
            order_details = [
                OrderDetails_25_Series(order_no=actuator, actuator_serial_no=f"{order_no}-{i}")
                for i in range(1, qty + 1)
            ]
            OrderDetails_25_Series.objects.bulk_create(order_details)
        elif series == "21":
            # Create OrderDetails_21_Series entries with auto-generated actuator_serial_no
            order_details = []
            for i in range(1, qty + 1):
                actuator_serial_no = f"{order_no}-{i}"
                order_details.append(
                    OrderDetails_21_Series(order_no=actuator, actuator_serial_no=actuator_serial_no)
                )
            OrderDetails_21_Series.objects.bulk_create(order_details)
        else:
            # Series is required - show error if not specified
            messages.error(request, "Series must be either '21' or '25'")
            return redirect("assembly_engineer_dashboard")

        messages.success(request, f"Added order {order_no} • Created {qty} serial units")
        return redirect("assembly_engineer_dashboard")

    # GET: render template with actuators list
    # Get query parameters
    search_query = request.GET.get('search', '')
    status_filter = request.GET.get('status', '')
    sort_by = request.GET.get('sort', 'created_at')
    sort_order = request.GET.get('order', 'desc')
    page = request.GET.get('page', 1)
    
    # Start with all actuators
    actuators_queryset = MainActuator.objects.all()
    
    # Apply search filter
    if search_query:
        actuators_queryset = actuators_queryset.filter(
            Q(order_no__icontains=search_query) |
            Q(sales_order_no__icontains=search_query) |
            Q(customer__icontains=search_query) |
            Q(item_code__icontains=search_query)
        )
    
    # Apply status filter
    if status_filter:
        actuators_queryset = actuators_queryset.filter(order_status=status_filter)
    
    # Apply sorting
    if sort_order == 'desc':
        sort_by = f'-{sort_by}'
    actuators_queryset = actuators_queryset.order_by(sort_by)
    
    # Pagination
    paginator = Paginator(actuators_queryset, 20)  # 20 items per page
    try:
        actuators = paginator.page(page)
    except PageNotAnInteger:
        actuators = paginator.page(1)
    except EmptyPage:
        actuators = paginator.page(paginator.num_pages)
    
    # Prepare context for template
    context = {
        'actuators': actuators,
        'search_query': search_query,
        'status_filter': status_filter,
        'sort_by': sort_by.lstrip('-'),
        'sort_order': sort_order,
        'status_choices': MainActuator.STATUS_CHOICES,
    }
    
    return render(request, "dashboards/assembly_engineer_dashboard.html", context)


# ================================================================
#   ASSEMBLER DASHBOARD
# ================================================================
@login_required
def assembler_dashboard(request):

    # Handle POST requests for save/submit operations
    if request.method == "POST":
        try:
            order_detail_id = request.POST.get("order_detail_id")
            series = request.POST.get("series")
            
            if not order_detail_id or not series:
                messages.error(request, "Missing required information")
                return redirect("assembler_dashboard")
            
            # Get the appropriate detail based on series
            if series == "25":
                detail = OrderDetails_25_Series.objects.get(id=order_detail_id)
            elif series == "21":
                detail = OrderDetails_21_Series.objects.get(id=order_detail_id)
            else:
                messages.error(request, "Invalid series specified")
                return redirect("assembler_dashboard")
            
            if "save" in request.POST:
                if series == "25":
                    # Update heat numbers for 25 series
                    fields = [
                        'housing_heat_no', 'yoke_heat_no', 'top_cover_heat_no',
                        'da_side_adaptor_plate_heat_no', 'spring_side_adaptor_heat_no',
                        'da_side_end_plate_heat_no', 'spring_side_end_plate_heat_no'
                    ]
                    for f in fields:
                        setattr(detail, f, request.POST.get(f, ""))
                elif series == "21":
                    # Update specific fields for 21 series
                    fields = ['body', 'end_cap_right', 'end_cap_left', 'pinion']
                    for f in fields:
                        setattr(detail, f, request.POST.get(f, ""))
                
                detail.save()
                messages.success(request, f"{series} Series details saved.")
            
            elif "submit" in request.POST:
                if series == "25":
                    # Validate all required heat numbers for 25 series
                    required = [
                        detail.housing_heat_no,
                        detail.yoke_heat_no,
                        detail.top_cover_heat_no,
                        detail.da_side_adaptor_plate_heat_no,
                        detail.spring_side_adaptor_heat_no,
                        detail.da_side_end_plate_heat_no,
                        detail.spring_side_end_plate_heat_no,
                    ]
                    if any(v in ["", None] for v in required):
                        messages.error(request, "All heat numbers required for 25 Series!")
                        return redirect("assembler_dashboard")
                
                elif series == "21":
                    # Validate required fields for 21 series
                    required = [
                        detail.body,
                        detail.end_cap_right,
                        detail.end_cap_left,
                        detail.pinion,
                    ]
                    if any(v in ["", None] for v in required):
                        messages.error(request, "All fields required for 21 Series!")
                        return redirect("assembler_dashboard")
                
                detail.assembler_status = "completed"
                detail.assembler_name = request.user
                detail.save()
                messages.success(request, f"{series} Series actuator marked completed.")
                
        except Exception as e:
            messages.error(request, f"Error: {e}")
        
        return redirect("assembler_dashboard")

    # Get all orders with assembly status for both series
    all_assembly_orders = MainActuator.objects.filter(
        models.Q(series="25") | models.Q(series="21")
    ).annotate(
        total_qty=models.Case(
            models.When(series="25", then=models.Count("order_details_25")),
            models.When(series="21", then=models.Count("order_details_21")),
            default=0,
            output_field=IntegerField()
        ),
        completed_qty=models.Case(
            models.When(
                series="25",
                then=models.Count(
                    "order_details_25",
                    filter=models.Q(order_details_25__assembler_status="completed")
                )
            ),
            models.When(
                series="21",
                then=models.Count(
                    "order_details_21",
                    filter=models.Q(order_details_21__assembler_status="completed")
                )
            ),
            default=0,
            output_field=IntegerField()
        )
    )

    # Process all orders and categorize them
    orders_under_assembly = []
    completed_orders = []
    
    for order in all_assembly_orders:
        # Calculate pending quantity
        pending_qty = order.total_qty - order.completed_qty
        
        # Create material description
        material = f"{order.series or ''}, {order.type or ''}, {order.size or ''}, {order.cylinder_size or ''}, {order.spring_size or ''}, {order.moc or ''}".strip(', ')
        
        # Add calculated fields to order object
        order.pending_qty = pending_qty
        order.material = material
        
        # Categorize orders based on pending quantity
        if pending_qty > 0:
            orders_under_assembly.append(order)
        else:
            completed_orders.append(order)

    # Get all orders for stats
    all_orders = MainActuator.objects.all()
    total_orders = all_orders.count()
    
    # Get current user's assigned orders from both tables
    orders_25_assigned = OrderDetails_25_Series.objects.filter(
        assembler_status__in=['pending', 'in_progress']
    ).values_list('order_no__order_no', flat=True).distinct()
    
    orders_21_assigned = OrderDetails_21_Series.objects.filter(
        assembler_status__in=['pending', 'in_progress']
    ).values_list('order_no__order_no', flat=True).distinct()
    
    my_orders = list(orders_25_assigned) + list(orders_21_assigned)
    my_orders = list(set(my_orders))  # Remove duplicates
    my_assigned_orders = MainActuator.objects.filter(order_no__in=my_orders)

    return render(request, "dashboards/assembler_dashboard.html", {
        "total_orders": total_orders,
        "my_orders": my_assigned_orders,
        "orders_under_assembly": orders_under_assembly,
        "completed_orders": completed_orders,
    })



# ================================================================
#   ASSEMBLER – ORDER DETAILS PAGE
# ================================================================
@login_required
def assembler_order_details(request, order_no):

    order = get_object_or_404(MainActuator, order_no=order_no)

    # Check series to determine which table to query
    if order.series == "25":
        actuators = (
            OrderDetails_25_Series.objects.filter(order_no=order)
            .annotate(serial_num=Cast(Substr("actuator_serial_no",
                                            len(order_no) + 2), IntegerField()))
            .order_by("serial_num")
        )
    elif order.series == "21":
        actuators = (
            OrderDetails_21_Series.objects.filter(order_no=order)
            .annotate(serial_num=Cast(Substr("actuator_serial_no",
                                            len(order_no) + 2), IntegerField()))
            .order_by("serial_num")
        )
    else:
        # Handle case where series is not specified
        actuators = []

    if request.method == "POST":
        try:
            pk = request.POST["order_detail_id"]
            
            # Get the detail based on series
            if order.series == "25":
                detail = OrderDetails_25_Series.objects.get(id=pk)
            elif order.series == "21":
                detail = OrderDetails_21_Series.objects.get(id=pk)
            else:
                messages.error(request, "Unknown series for this order")
                return redirect("assembler_order_details", order_no=order_no)

            if "save" in request.POST:
                if order.series == "25":
                    # Update heat numbers for 25 series
                    fields = [
                        'housing_heat_no', 'yoke_heat_no', 'top_cover_heat_no',
                        'da_side_adaptor_plate_heat_no', 'spring_side_adaptor_heat_no',
                        'da_side_end_plate_heat_no', 'spring_side_end_plate_heat_no'
                    ]

                    for f in fields:
                        setattr(detail, f, request.POST.get(f, ""))

                    detail.save()
                    messages.success(request, "Heat numbers saved.")
                elif order.series == "21":
                    # Update specific fields for 21 series
                    fields = ['body', 'end_cap_right', 'end_cap_left', 'pinion']
                    
                    for f in fields:
                        setattr(detail, f, request.POST.get(f, ""))
                    
                    # Also update assembler name if provided
                    if request.POST.get('assembler_name'):
                        detail.assembler_name = request.user
                    
                    detail.save()
                    messages.success(request, "21 Series details saved.")

            if "submit" in request.POST:
                if order.series == "25":
                    # Validate all required heat numbers for 25 series
                    required = [
                        detail.housing_heat_no,
                        detail.yoke_heat_no,
                        detail.top_cover_heat_no,
                        detail.da_side_adaptor_plate_heat_no,
                        detail.spring_side_adaptor_heat_no,
                        detail.da_side_end_plate_heat_no,
                        detail.spring_side_end_plate_heat_no,
                    ]

                    if any(v in ["", None] for v in required):
                        messages.error(request, "All heat numbers required!")
                        return redirect("assembler_order_details", order_no=order_no)

                    detail.assembler_status = "completed"
                    detail.assembler_name = request.user
                    detail.save()
                    messages.success(request, "25 Series actuator marked completed.")
                    
                elif order.series == "21":
                    # Validate required fields for 21 series
                    required = [
                        detail.body,
                        detail.end_cap_right,
                        detail.end_cap_left,
                        detail.pinion,
                    ]

                    if any(v in ["", None] for v in required):
                        messages.error(request, "All fields are required!")
                        return redirect("assembler_order_details", order_no=order_no)

                    detail.assembler_status = "completed"
                    detail.assembler_name = request.user
                    detail.save()
                    messages.success(request, "21 Series actuator marked completed.")

        except Exception as e:
            messages.error(request, f"Error: {e}")

        return redirect("assembler_order_details", order_no=order_no)

    return render(request, "dashboards/assembler_order_details.html", {
        "order": order,
        "actuators": actuators,
    })



# ================================================================
#   HEAT REPORT – PDF GENERATION
# ================================================================
@login_required
def generate_heat_report(request, order_no):

    order = get_object_or_404(MainActuator, order_no=order_no)
    
    # Get items based on series
    if order.series == "25":
        items = OrderDetails_25_Series.objects.filter(order_no=order).order_by("actuator_serial_no")
    elif order.series == "21":
        items = OrderDetails_21_Series.objects.filter(order_no=order).order_by("actuator_serial_no")
    else:
        items = []

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="Heat_Report_{order_no}.pdf"'

    pdf = canvas.Canvas(response, pagesize=landscape(A4))
    width, height = landscape(A4)

    y = height - 1.5 * cm

    # ------------------------------
    # TITLE
    # ------------------------------
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawCentredString(width / 2, y, "DELVAL FLOW CONTROLS PRIVATE LIMITED")
    y -= 1.2 * cm

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawCentredString(width / 2, y, "HEAT ANNEXTURE - ACTUATOR")
    y -= 1.5 * cm

    # ------------------------------
    # TOP TABLE
    # ------------------------------
    top_data = [
        ["Item Code:", order.item_code, "Size:", f"{order.size}, {order.cylinder_size}, {order.spring_size or '-'}"],
        ["Qty:", order.order_qty, "Date:", datetime.now().strftime("%d-%m-%Y")],
        ["Customer:", order.customer, "SO Number:", order.sales_order_no],
    ]

    top_table = Table(top_data, colWidths=[3*cm, 7*cm, 3*cm, 7*cm])
    top_table.setStyle(TableStyle([
        ("FONTNAME", (0,0), (-1,-1), "Helvetica"),
        ("FONTSIZE", (0,0), (-1,-1), 11),
        ("ALIGN", (0,0), (-1,-1), "LEFT"),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))

    top_table.wrapOn(pdf, width, height)
    top_table.drawOn(pdf, 1*cm, y-3*cm)

    y -= 4*cm

    # ------------------------------
    # MAIN TABLE
    # ------------------------------
    headers = [
        "Sr No", "Actuator Serial", "Housing Heat No", "Yoke Heat No",
        "Top Cover", "DA Adaptor", "Spring Adaptor", "DA End Plate",
        "Spring End Plate", "Assembler"
    ]

    assembler = request.user.get_full_name() or request.user.username

    table_data = [headers]
    for i, a in enumerate(items, start=1):
        if order.series == "25":
            table_data.append([
                i,
                a.actuator_serial_no,
                a.housing_heat_no or "",
                a.yoke_heat_no or "",
                a.top_cover_heat_no or "",
                a.da_side_adaptor_plate_heat_no or "",
                a.spring_side_adaptor_heat_no or "",
                a.da_side_end_plate_heat_no or "",
                a.spring_side_end_plate_heat_no or "",
                assembler
            ])
        elif order.series == "21":
            table_data.append([
                i,
                a.actuator_serial_no,
                a.body or "",
                a.end_cap_right or "",
                a.end_cap_left or "",
                a.pinion or "",
                "", "", "", "",  # Empty columns for heat number fields
                assembler
            ])

    table = Table(table_data, repeatRows=1, colWidths=[1.5*cm] + [3*cm]*9)

    table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.4, colors.black),
        ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("ALIGN", (0,0), (-1,0), "CENTER"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
    ]))

    table.wrapOn(pdf, width, height)

    # Auto calculate table height
    table_height = len(table_data) * 0.7 * cm

    table.drawOn(pdf, 1*cm, y - table_height)

    pdf.showPage()
    pdf.save()



# ================================================================
#   ASSEMBLER – PRINT ORDER REPORT
# ================================================================
@login_required
def print_order_report(request, order_no):
    """
    Generate a horizontal, well-aligned print report for an order
    """
    order = get_object_or_404(MainActuator, order_no=order_no)
    
    # Get items based on series
    if order.series == "25":
        items = OrderDetails_25_Series.objects.filter(order_no=order).order_by("actuator_serial_no")
    elif order.series == "21":
        items = OrderDetails_21_Series.objects.filter(order_no=order).order_by("actuator_serial_no")
    else:
        items = []

    response = HttpResponse(content_type="text/html")
    
    # Create HTML content for the report
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Order Report - {order.order_no}</title>
        <style>
            @page {{
                size: landscape;
                margin: 1cm;
            }}
            body {{
                font-family: Arial, sans-serif;
                font-size: 10px;
                margin: 0;
                padding: 0;
            }}
            .header {{
                text-align: center;
                margin-bottom: 20px;
            }}
            .company-name {{
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }}
            .report-title {{
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 20px;
            }}
            .order-info {{
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
            }}
            .info-item {{
                margin-bottom: 5px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }}
            th, td {{
                border: 1px solid #000;
                padding: 5px;
                text-align: left;
                vertical-align: top;
            }}
            th {{
                background-color: #f2f2f2;
                font-weight: bold;
                white-space: nowrap;
            }}
            .sr-no {{
                width: 5%;
            }}
            .serial-no {{
                width: 10%;
            }}
            .field-col {{
                width: 10%;
            }}
            .status-col {{
                width: 8%;
            }}
            .assembler-col {{
                width: 12%;
            }}
            .completed {{
                background-color: #e8f5e8;
            }}
            @media print {{
                body {{
                    font-size: 9px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">DELVAL FLOW CONTROLS PRIVATE LIMITED</div>
            <div class="report-title">HEAT ANNEXTURE - ACTUATOR</div>
        </div>
        
        <div class="order-info">
            <div>
                <div class="info-item"><strong>Item Code:</strong> {order.item_code}</div>
                <div class="info-item"><strong>Size:</strong> {order.size}, {order.cylinder_size}, {order.spring_size or '-'}</div>
                <div class="info-item"><strong>Qty:</strong> {order.order_qty}</div>
            </div>
            <div>
                <div class="info-item"><strong>Date:</strong> {datetime.now().strftime("%d-%m-%Y")}</div>
                <div class="info-item"><strong>Customer:</strong> {order.customer}</div>
                <div class="info-item"><strong>SO Number:</strong> {order.sales_order_no}</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th class="sr-no">Sr No</th>
                    <th class="serial-no">Actuator Serial</th>
    """
    
    # Add series-specific headers
    if order.series == "25":
        html_content += """
                    <th class="field-col">Housing Heat No</th>
                    <th class="field-col">Yoke Heat No</th>
                    <th class="field-col">Top Cover Heat No</th>
                    <th class="field-col">DA Side Adaptor</th>
                    <th class="field-col">Spring Side Adaptor</th>
                    <th class="field-col">DA End Plate</th>
                    <th class="field-col">Spring End Plate</th>
        """
    elif order.series == "21":
        html_content += """
                    <th class="field-col">Body</th>
                    <th class="field-col">End Cap Right</th>
                    <th class="field-col">End Cap Left</th>
                    <th class="field-col">Pinion</th>
        """
    
    html_content += """
                    <th class="status-col">Status</th>
                    <th class="assembler-col">Assembler</th>
                </tr>
            </thead>
            <tbody>
    """
    
    # Add table rows
    for i, item in enumerate(items, start=1):
        status_class = "completed" if item.assembler_status == "completed" else ""
        assembler_name = item.assembler_name.get_full_name() if item.assembler_name else ""
        
        html_content += f"""
                <tr class="{status_class}">
                    <td class="sr-no">{i}</td>
                    <td class="serial-no">
        """
        
        if order.series == "25":
            html_content += f"""
                        {item.actuator_serial_no}
                    </td>
                    <td class="field-col">{item.housing_heat_no or ""}</td>
                    <td class="field-col">{item.yoke_heat_no or ""}</td>
                    <td class="field-col">{item.top_cover_heat_no or ""}</td>
                    <td class="field-col">{item.da_side_adaptor_plate_heat_no or ""}</td>
                    <td class="field-col">{item.spring_side_adaptor_heat_no or ""}</td>
                    <td class="field-col">{item.da_side_end_plate_heat_no or ""}</td>
                    <td class="field-col">{item.spring_side_end_plate_heat_no or ""}</td>
            """
        elif order.series == "21":
            html_content += f"""
                        {item.actuator_serial_no}
                    </td>
                    <td class="field-col">{item.body or ""}</td>
                    <td class="field-col">{item.end_cap_right or ""}</td>
                    <td class="field-col">{item.end_cap_left or ""}</td>
                    <td class="field-col">{item.pinion or ""}</td>
            """
        
        html_content += f"""
                    <td class="status-col">
                        {'Completed' if item.assembler_status == 'completed' else 'Pending'}
                    </td>
                    <td class="assembler-col">{assembler_name}</td>
                </tr>
        """
    
    html_content += """
            </tbody>
        </table>
        
        <script>
            // Auto print when page loads
            window.onload = function() {{
                window.print();
            }};
        </script>
    </body>
    </html>
    """
    
    response.write(html_content)
    return response
    return response