@echo off
echo ===============================================
echo Category Management Fix Verification
echo ===============================================
echo.
echo This script will check if the fixes are working
echo.
echo Step 1: Checking TypeScript compilation...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Build completed successfully!
echo.
echo Step 2: Starting development server...
echo.
echo Please test the following:
echo 1. Navigate to http://localhost:3000/category
echo 2. Try editing a category (click the blue pencil icon)
echo 3. Try deleting a category (click the red trash icon)
echo.
echo Press Ctrl+C to stop the server when done testing
echo.
call npm run dev
