#!/usr/bin/env python
"""
Test script for manufacturing order tables implementation
This script tests the new OrderDetails25Series and OrderDetails21Series models
"""

import os
import sys
import django

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ReportManagement.settings')
django.setup()

from manufacturing.models import MainActuator, OrderDetails25Series, OrderDetails21Series
from django.contrib.auth.models import User

def test_models():
    """Test the new models"""
    print("Testing manufacturing order tables implementation...")
    
    try:
        # Test creating a MainActuator with 25 series
        print("\n1. Testing 25 Series Actuator Creation...")
        actuator_25 = MainActuator.objects.create(
            sales_order_no="SO-2025-001",
            order_no="ORD-25-001",
            customer="Test Customer 1",
            series="25",
            type="Type A",
            size="Large",
            cylinder_size="10 inch",
            moc="Steel",
            order_qty="3",
            item_code="ITEM-25-001",
            creation_date="2025-01-01",
            branch="Branch 1"
        )
        print(f"   ✓ Created 25 Series Actuator: {actuator_25}")
        
        # Test creating OrderDetails25Series entries
        print("\n2. Testing 25 Series Order Details Creation...")
        order_details_25 = [
            OrderDetails25Series(order_no=actuator_25, actuator_serial_no=f"ORD-25-001-{i}")
            for i in range(1, 4)
        ]
        OrderDetails25Series.objects.bulk_create(order_details_25)
        print(f"   ✓ Created 3 OrderDetails25Series entries")
        
        # Verify the entries
        details_25 = OrderDetails25Series.objects.filter(order_no=actuator_25)
        print(f"   ✓ Retrieved {details_25.count()} OrderDetails25Series entries")
        
        # Test creating a MainActuator with 21 series
        print("\n3. Testing 21 Series Actuator Creation...")
        actuator_21 = MainActuator.objects.create(
            sales_order_no="SO-2025-002",
            order_no="ORD-21-001",
            customer="Test Customer 2",
            series="21",
            type="Type B",
            size="Small",
            cylinder_size="6 inch",
            moc="Aluminum",
            order_qty="2",
            item_code="ITEM-21-001",
            creation_date="2025-01-02",
            branch="Branch 2"
        )
        print(f"   ✓ Created 21 Series Actuator: {actuator_21}")
        
        # Test creating OrderDetails21Series entries with auto-generated sr_no
        print("\n4. Testing 21 Series Order Details Creation...")
        order_details_21 = []
        for i in range(1, 3):
            sr_no = f"ORD-21-001-{i}"
            order_details_21.append(
                OrderDetails21Series(order_no=actuator_21, sr_no=sr_no)
            )
        OrderDetails21Series.objects.bulk_create(order_details_21)
        print(f"   ✓ Created 2 OrderDetails21Series entries with sr_no format")
        
        # Verify the entries
        details_21 = OrderDetails21Series.objects.filter(order_no=actuator_21)
        print(f"   ✓ Retrieved {details_21.count()} OrderDetails21Series entries")
        
        # Test reverse relationships
        print("\n5. Testing Reverse Relationships...")
        details_25_via_main = actuator_25.order_details_25.all()
        details_21_via_main = actuator_21.order_details_21.all()
        print(f"   ✓ 25 Series details via MainActuator: {details_25_via_main.count()}")
        print(f"   ✓ 21 Series details via MainActuator: {details_21_via_main.count()}")
        
        # Test string representations
        print("\n6. Testing String Representations...")
        for detail in details_25:
            print(f"   ✓ OrderDetails25Series: {detail}")
        for detail in details_21:
            print(f"   ✓ OrderDetails21Series: {detail}")
        
        # Test series-specific fields for 21 series
        print("\n7. Testing 21 Series Specific Fields...")
        detail_21 = OrderDetails21Series.objects.filter(order_no=actuator_21).first()
        if detail_21:
            detail_21.body = "Body Material A"
            detail_21.end_cap_right = "ECR-001"
            detail_21.end_cap_left = "ECL-001"
            detail_21.pinion = "Pinion Type B"
            detail_21.save()
            print(f"   ✓ Updated 21 Series fields: Body={detail_21.body}, Pinion={detail_21.pinion}")
        
        print("\n✅ All tests passed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

def cleanup_test_data():
    """Clean up test data"""
    print("\nCleaning up test data...")
    try:
        MainActuator.objects.filter(order_no__in=["ORD-25-001", "ORD-21-001"]).delete()
        print("✓ Test data cleaned up")
    except Exception as e:
        print(f"❌ Cleanup failed: {e}")

if __name__ == "__main__":
    success = test_models()
    if success:
        print("\n🎉 Manufacturing order tables implementation is working correctly!")
    else:
        print("\n💥 There are issues with the implementation that need to be fixed.")
    
    # Uncomment the line below to clean up test data after successful tests
    # cleanup_test_data()