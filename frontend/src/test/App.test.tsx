import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { store } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';

describe('Phase 3 & Phase 2 — Auth Flow & Application Shell', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    store.dispatch(logout());
  });

  it('redirects unauthenticated visitor to the Login screen', async () => {
    render(<App />);
    expect(await screen.findByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in to access your AI-powered career roadmap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Your Workspace/i })).toBeInTheDocument();
  });

  describe('Authenticated Application Shell', () => {
    beforeEach(() => {
      window.history.pushState({}, '', '/');
      store.dispatch(
        setCredentials({
          user: {
            id: 1,
            email: 'alex.chen@example.com',
            first_name: 'Alex',
            last_name: 'Chen',
            is_active: true,
          },
          accessToken: 'mock-access-token-jwt',
          refreshToken: 'mock-refresh-token',
        })
      );
    });

    it('renders application header brand and Pro SaaS badge', async () => {
      render(<App />);
      const brands = await screen.findAllByText(/AI Career Coach/i);
      expect(brands.length).toBeGreaterThan(0);
      expect(screen.getByText(/Pro SaaS/i)).toBeInTheDocument();
    });

    it('renders all 4 primary navigation sections in sidebar', async () => {
      render(<App />);
      const overviews = await screen.findAllByText(/OVERVIEW/i);
      expect(overviews.length).toBeGreaterThan(0);
      expect(screen.getAllByText(/AI CAREER TOOLS/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/CAREER MANAGEMENT/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/ACCOUNT/i)[0]).toBeInTheDocument();
    });

    it('renders all requested sidebar navigation items', async () => {
      render(<App />);
      expect((await screen.findAllByText(/Dashboard/i)).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Resume Analyzer/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/LinkedIn Optimizer/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Interview Preparation/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Skill Gap Analyzer/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Learning Roadmap/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Job Tracker/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Analytics/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/My Profile/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Settings/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Help & Support/i).length).toBeGreaterThan(0);
    });

    it('renders accessible user account menu with authenticated user on trigger click', async () => {
      render(<App />);
      const avatarBtn = await screen.findByLabelText(/account user menu/i);
      expect(avatarBtn).toBeInTheDocument();
      fireEvent.click(avatarBtn);
      expect(screen.getByText(/Alex Chen/i)).toBeInTheDocument();
      expect(screen.getByText(/alex.chen@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
    });

    it('renders notifications menu with unread badges', async () => {
      render(<App />);
      const bellBtn = await screen.findByLabelText(/unread notifications/i);
      expect(bellBtn).toBeInTheDocument();
      fireEvent.click(bellBtn);
      expect((await screen.findAllByText(/Notifications/i)).length).toBeGreaterThan(0);
    });

    it('renders responsive quick launch tools on dashboard', async () => {
      render(<App />);
      expect(await screen.findByText(/Career Command Center/i)).toBeInTheDocument();
    });
  });
});
