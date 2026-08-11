#!/bin/bash

echo "========================================="
echo "  Lucra - Local Setup Script"
echo "========================================="
echo ""

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        echo "   Visit: $2"
        return 1
    else
        echo "✅ $1 is installed"
        return 0
    fi
}

echo "Checking prerequisites..."
echo ""

check_command node "https://nodejs.org/"
NODE_INSTALLED=$?

check_command npm "https://nodejs.org/"
NPM_INSTALLED=$?

echo ""

if [ $NODE_INSTALLED -ne 0 ] || [ $NPM_INSTALLED -ne 0 ]; then
    echo "❌ Missing required dependencies. Please install them and try again."
    exit 1
fi

echo "========================================="
echo "  Step 1: Installing Dependencies"
echo "========================================="
echo ""

if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "❌ package.json not found. Make sure you're in the project directory."
    exit 1
fi

echo ""
echo "========================================="
echo "  Step 2: Environment Variables"
echo "========================================="
echo ""

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOL
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
EOL
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: You need to update the .env file with your actual credentials:"
    echo "   1. Supabase URL and Anon Key from: https://supabase.com/dashboard"
    echo "   2. Gemini API Key from: https://makersuite.google.com/app/apikey"
    echo ""
else
    echo "⚠️  .env file already exists. Skipping creation."
    echo ""
fi

echo "========================================="
echo "  Step 3: Database Setup"
echo "========================================="
echo ""

if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI is installed"
    echo ""
    read -p "Do you want to apply database migrations now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your Supabase project ref: " PROJECT_REF
        supabase link --project-ref $PROJECT_REF
        supabase db push
        echo "✅ Migrations applied"
    else
        echo "⚠️  Skipping migrations. You can apply them later with:"
        echo "   supabase link --project-ref YOUR_PROJECT_REF"
        echo "   supabase db push"
    fi
else
    echo "⚠️  Supabase CLI not found"
    echo ""
    echo "To install Supabase CLI:"
    echo "   npm install -g supabase"
    echo ""
    echo "Or manually apply migrations:"
    echo "   1. Go to your Supabase Dashboard"
    echo "   2. Navigate to SQL Editor"
    echo "   3. Run each file in supabase/migrations/ in order"
fi

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Update .env file with your API keys"
echo "2. Apply database migrations (if not done)"
echo "3. Deploy edge functions to Supabase"
echo "4. Run: npm run dev"
echo ""
echo "For detailed instructions, see README.md"
echo ""
echo "========================================="
