import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { User } from '../types';

// Layouts
import RootLayout from './layouts/RootLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import AuthLayout from './layouts/AuthLayout';

// Public pages
import HomePage from '../pages/HomePage';
import ProjectsPage from '../pages/ProjectsPage';
import Altair52Page from '../pages/projects/Altair52Page';
import ShahrukhzPage from '../pages/projects/ShahrukhzPage';
import Masaar3Page from '../pages/projects/Masaar3Page';
import Artize62Page from '../pages/projects/Artize62Page';
import AviorPage from '../pages/projects/AviorPage';
import DynamicPropertyPage from '../pages/projects/DynamicPropertyPage';
import AboutPage from '../pages/AboutPage';
import BlogsPage from '../pages/BlogsPage';
import ContactPage from '../pages/ContactPage';
import PrivacyPage from '../pages/PrivacyPage';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import StaffRegisterPage from '../pages/auth/StaffRegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';

// Protected pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import ContentStudioPage from '../pages/dashboard/ContentStudioPage';
import MarketIntelligencePage from '../pages/dashboard/MarketIntelligencePage';
import FinanceIntelligencePage from '../pages/dashboard/FinanceIntelligencePage';
import ClientsPage from '../pages/dashboard/ClientsPage';
import ContractsPage from '../pages/dashboard/ContractsPage';
import MasterPromptsPage from '../pages/dashboard/MasterPromptsPage';
import DarieAssistantPage from '../pages/dashboard/DarieAssistantPage';
import PropertyIntelligencePage from '../pages/dashboard/PropertyIntelligencePage';
import CRMPage from '../pages/dashboard/CRMPage';

export const createAppRouter = (
  currentUser: User | null,
  isLoggedIn: boolean,
  onLogin: (user: User) => void,
  onLogout: () => void,
  requiresPasswordChange: boolean,
  setRequiresPasswordChange: (value: boolean) => void
) => {
  return createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: 'projects',
          element: <ProjectsPage />,
        },
        {
          path: 'projects/altair-52',
          element: <Altair52Page />,
        },
        {
          path: 'projects/shahrukhz',
          element: <ShahrukhzPage />,
        },
        {
          path: 'projects/masaar-3',
          element: <Masaar3Page />,
        },
        {
          path: 'projects/artize-62',
          element: <Artize62Page />,
        },
        {
          path: 'projects/avior',
          element: <AviorPage />,
        },
        {
          path: 'projects/:propertyId',
          element: <DynamicPropertyPage />,
        },
        {
          path: 'about',
          element: <AboutPage />,
        },
        {
          path: 'blogs',
          element: <BlogsPage />,
        },
        {
          path: 'contact',
          element: <ContactPage />,
        },
        {
          path: 'privacy',
          element: <PrivacyPage />,
        },
      ],
    },
    {
      path: '/auth',
      element: <AuthLayout isLoggedIn={isLoggedIn} />,
      children: [
        {
          index: true,
          element: <Navigate to="/auth/login" replace />,
        },
        {
          path: 'login',
          element: (
            <LoginPage
              onClientSuccess={onLogin}
              onStaffSuccess={onLogin}
              requiresPasswordChange={requiresPasswordChange}
              setRequiresPasswordChange={setRequiresPasswordChange}
            />
          ),
        },
        {
          path: 'signup',
          element: <SignupPage onSuccess={onLogin} />,
        },
        {
          path: 'staff-register',
          element: <StaffRegisterPage onSuccess={onLogin} />,
        },
        {
          path: 'forgot-password',
          element: <ForgotPasswordPage />,
        },
        {
          path: 'change-password',
          element: (
            <ChangePasswordPage
              currentUser={currentUser}
              onSuccess={() => setRequiresPasswordChange(false)}
            />
          ),
        },
      ],
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedLayout
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLogout={onLogout}
        />
      ),
      children: [
        {
          index: true,
          element: <DashboardPage currentUser={currentUser} />,
        },
        {
          path: 'content-studio',
          element: <ContentStudioPage currentUser={currentUser} />,
        },
        {
          path: 'market-intelligence',
          element: <MarketIntelligencePage />,
        },
        {
          path: 'finance-intelligence',
          element: <FinanceIntelligencePage />,
        },
        {
          path: 'clients',
          element: <ClientsPage currentUser={currentUser} />,
        },
        {
          path: 'crm',
          element: <CRMPage currentUser={currentUser} />,
        },
        {
          path: 'contracts',
          element: <ContractsPage currentUser={currentUser} />,
        },
        {
          path: 'master-prompts',
          element: <MasterPromptsPage />,
        },
        {
          path: 'property-intelligence',
          element: <PropertyIntelligencePage />,
        },
        {
          path: 'darie-assistant',
          element: <DarieAssistantPage />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);
};
