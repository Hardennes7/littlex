# test_import.py
import sys
import os

print("=" * 60)
print("TESTING IMPORTS")
print("=" * 60)

print(f"\n1. Current directory: {os.getcwd()}")
print(f"2. Python executable: {sys.executable}")

# Check if we can find the app folder
print(f"\n3. Checking directory structure:")
print(f"   - app folder exists: {os.path.exists('app')}")
print(f"   - app/routes folder exists: {os.path.exists('app/routes')}")
print(f"   - app/routes/walker.py exists: {os.path.exists('app/routes/walker.py')}")
print(f"   - app/routes/__init__.py exists: {os.path.exists('app/routes/__init__.py')}")
print(f"   - app/__init__.py exists: {os.path.exists('app/__init__.py')}")

# Try to import
print(f"\n4. Attempting to import walker router...")
try:
    from app.routes.walker import router
    print("   ✅ SUCCESS: Imported walker router!")
    
    # Check what's in the router
    print(f"\n5. Router details:")
    print(f"   - Router object: {router}")
    
    if hasattr(router, 'routes'):
        print(f"\n6. Available endpoints:")
        for route in router.routes:
            print(f"   - {route.methods} {route.path}")
    else:
        print("\n6. Router has no routes attribute")
        
except ImportError as e:
    print(f"   ❌ FAILED: Import error")
    print(f"   Error details: {e}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
