@echo off
echo =========================================
echo   Lucra - Local Setup Script (Windows)
echo =========================================
echo.

echo Checking prerequisites...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X node is not installed. Please install it first.
    echo   Visit: https://nodejs.org/
    goto :error
) else (
    echo √ node is installed
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X npm is not installed. Please install it first.
    echo   Visit: https://nodejs.org/
    goto :error
) else (
    echo √ npm is installed
)

echo.
echo =========================================
echo   Step 1: Installing Dependencies
echo =========================================
echo.

if not exist package.json (
    echo X package.json not found. Make sure you're in the project directory.
    goto :error
)

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo X Failed to install dependencies
    goto :error
) else (
    echo √ Dependencies installed successfully
)

echo.
echo =========================================
echo   Step 2: Environment Variables
echo =========================================
echo.

if not exist .env (
    echo Creating .env file...
    (
        echo VITE_SUPABASE_URL=your_supabase_project_url
        echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        echo VITE_GEMINI_API_KEY=your_gemini_api_key
    ) > .env
    echo √ .env file created
    echo.
    echo ! IMPORTANT: You need to update the .env file with your actual credentials:
    echo   1. Supabase URL and Anon Key from: https://supabase.com/dashboard
    echo   2. Gemini API Key from: https://makersuite.google.com/app/apikey
    echo.
) else (
    echo ! .env file already exists. Skipping creation.
    echo.
)

echo =========================================
echo   Step 3: Database Setup
echo =========================================
echo.

where supabase >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo √ Supabase CLI is installed
    echo.
    set /p MIGRATE="Do you want to apply database migrations now? (y/n): "
    if /i "%MIGRATE%"=="y" (
        set /p PROJECT_REF="Enter your Supabase project ref: "
        call supabase link --project-ref %PROJECT_REF%
        call supabase db push
        echo √ Migrations applied
    ) else (
        echo ! Skipping migrations. You can apply them later with:
        echo   supabase link --project-ref YOUR_PROJECT_REF
        echo   supabase db push
    )
) else (
    echo ! Supabase CLI not found
    echo.
    echo To install Supabase CLI:
    echo   npm install -g supabase
    echo.
    echo Or manually apply migrations:
    echo   1. Go to your Supabase Dashboard
    echo   2. Navigate to SQL Editor
    echo   3. Run each file in supabase/migrations/ in order
)

echo.
echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo Next steps:
echo.
echo 1. Update .env file with your API keys
echo 2. Apply database migrations (if not done)
echo 3. Deploy edge functions to Supabase
echo 4. Run: npm run dev
echo.
echo For detailed instructions, see README.md
echo.
echo =========================================
pause
exit /b 0

:error
echo.
echo Setup failed. Please fix the errors above and try again.
pause
exit /b 1
