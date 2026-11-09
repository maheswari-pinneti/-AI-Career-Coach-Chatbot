import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { AppInput } from '../components/common/AppInput';
import { AppCard } from '../components/common/AppCard';
import { AppEmptyState } from '../components/common/AppEmptyState';
import { AppDialog } from '../components/common/AppDialog';

describe('Design System Components', () => {
  it('AppButton renders label, handles click, and shows loading state', () => {
    const handleClick = vi.fn();
    const { rerender } = render(<AppButton onClick={handleClick}>Submit</AppButton>);

    const button = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(<AppButton isLoading loadingText="Saving...">Submit</AppButton>);
    expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
  });

  it('AppBadge renders variant and label properly', () => {
    render(<AppBadge label="Verified Role" color="success" variant="subtle" dot />);
    expect(screen.getByText(/Verified Role/i)).toBeInTheDocument();
  });

  it('AppInput renders label, input, and error messages', () => {
    render(
      <AppInput
        label="Target Role"
        placeholder="e.g. Lead Architect"
        errorMessage="Role title is required"
      />
    );
    expect(screen.getByText(/Target Role/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Lead Architect/i)).toBeInTheDocument();
    expect(screen.getByText(/Role title is required/i)).toBeInTheDocument();
  });

  it('AppCard renders header, children, and footer', () => {
    render(
      <AppCard title="ATS Score" subtitle="Algorithm benchmark" footer={<button>Review</button>}>
        <p>Score content</p>
      </AppCard>
    );
    expect(screen.getByText(/ATS Score/i)).toBeInTheDocument();
    expect(screen.getByText(/Algorithm benchmark/i)).toBeInTheDocument();
    expect(screen.getByText(/Score content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Review/i })).toBeInTheDocument();
  });

  it('AppEmptyState displays title, description, and action button', () => {
    const handleAction = vi.fn();
    render(
      <AppEmptyState
        title="No resumes uploaded"
        description="Upload your first resume to calculate ATS scores."
        actionLabel="Upload PDF"
        onAction={handleAction}
      />
    );
    expect(screen.getByText(/No resumes uploaded/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload your first resume/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Upload PDF/i }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('AppDialog manages open state and close callbacks', () => {
    const handleClose = vi.fn();
    render(
      <AppDialog open={true} title="Dialog Title" onClose={handleClose}>
        <p>Dialog Body Content</p>
      </AppDialog>
    );
    expect(screen.getByText(/Dialog Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Dialog Body Content/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/close dialog/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
