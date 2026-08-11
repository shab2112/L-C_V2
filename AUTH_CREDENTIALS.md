# Authentication Credentials for Testing

This document contains test credentials for the fully functional authentication system.

## Overview

The application now has complete end-to-end authentication for both staff and client users:

- **Staff Users**: Owner, Admin, Property Advisor roles with email/password login
- **Client Users**: Register with email/phone + OTP verification, then login with email/password

## Staff Test Accounts

All staff accounts use the same test password for development: `Admin123!`

### Owner Account
- **Email**: `zaid@lockwoodcarter.com`
- **Password**: `Admin123!`
- **Role**: Owner
- **Name**: Zaid Al-Husseini

### Admin Account
- **Email**: `fatima@lockwoodcarter.com`
- **Password**: `Admin123!`
- **Role**: Admin
- **Name**: Fatima Al-Fahim

### Property Advisor Accounts

1. **Liam Chen**
   - **Email**: `liam@lockwoodcarter.com`
   - **Password**: `Admin123!`
   - **Role**: Property Advisor

2. **Sophia Petrova**
   - **Email**: `sophia@lockwoodcarter.com`
   - **Password**: `Admin123!`
   - **Role**: Property Advisor

3. **David Rodriguez**
   - **Email**: `david@lockwoodcarter.com`
   - **Password**: `Admin123!`
   - **Role**: Property Advisor

## Client Registration

Clients must register through the "Client Sign Up" flow:

1. Fill in personal details (first name, last name, email, phone, location, password)
2. Receive OTP code via email
3. Verify OTP to complete registration
4. Login with email and password

**Note**: For testing client registration, you'll need a valid email address to receive the OTP code.

## Staff Registration

New staff accounts can be created through the "Staff Registration" link on the landing page:

1. Fill in staff details (name, email, phone, password, role)
2. Provide admin credentials for authorization (use any Owner or Admin account above)
3. Account is created immediately and user is logged in

## Database Tables

The authentication system uses the following tables:

### For Staff Users
- `users` table stores staff account information
- Columns: `id`, `email`, `name`, `role`, `phone`, `password_hash`, `avatar`
- Roles: `Owner`, `Admin`, `Property Advisor`

### For Client Users
- `users` table stores basic user information (with role = 'Client')
- `clients` table links to properties and advisors
- `client_profiles` table stores detailed client information and password hash
- `client_otp_verifications` table handles OTP verification during registration

## Authentication Flow

### Staff Login
1. User enters email and password
2. System checks `users` table for matching staff role
3. Verifies password against `password_hash`
4. Returns user details with role-based access

### Client Registration
1. User fills registration form with email, phone, and password
2. System checks for existing account
3. Generates 6-digit OTP code
4. Sends OTP via email
5. User verifies OTP
6. System creates:
   - User record in `users` table (role = 'Client')
   - Client record in `clients` table
   - Profile record in `client_profiles` table (with hashed password)

### Client Login
1. User enters email and password
2. System checks `client_profiles` table for matching email
3. Verifies password against `password_hash`
4. Returns user details

### Unified Login
- Single login form handles both staff and client authentication
- System first checks `client_profiles`, then `users` table
- Returns appropriate user type and role

## Security Features

- ✅ Passwords hashed using bcrypt (cost factor 10)
- ✅ OTP codes expire after 10 minutes
- ✅ Maximum 5 OTP verification attempts
- ✅ Staff registration requires admin authorization
- ✅ Role-based access control
- ✅ Password minimum length: 8 characters
- ✅ Phone number validation
- ✅ Email uniqueness validation
- ✅ Temporary password support for staff (24-hour expiry)
- ✅ Forced password change on first login (configurable)

## API Endpoints (Edge Functions)

All authentication endpoints are deployed as Supabase Edge Functions:

- `staff-login` - Staff email/password authentication
- `client-login` - Client email/password authentication
- `unified-login` - Universal login for both staff and clients
- `staff-register` - Create new staff accounts (requires admin auth)
- `generate-client-otp` - Start client registration with OTP
- `verify-client-otp` - Complete client registration
- `change-password` - Update user password
- `request-password-reset` - Initiate password reset flow
- `reset-password` - Complete password reset

## Environment Variables Required

The following environment variables must be set (already configured):

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for edge functions)
- `RESEND_API_KEY` - Resend API key for sending OTP emails

## Testing Checklist

- [x] Staff login with email/password
- [x] Client registration with OTP verification
- [x] Client login with email/password
- [x] Unified login form (auto-detects user type)
- [x] Staff registration with admin authorization
- [x] Password validation (min 8 characters)
- [x] Email uniqueness validation
- [x] Phone number validation
- [x] Role-based dashboard access
- [x] User data fetched from database
- [x] Password change functionality
- [x] Forgot password flow

## Notes

- All passwords are securely hashed and never stored in plain text
- OTP codes are sent via email (Resend API)
- Staff accounts can only be created by existing Owners or Admins
- Client accounts are self-service registration
- The system automatically determines user type during login
- Role-based access control is enforced throughout the application
