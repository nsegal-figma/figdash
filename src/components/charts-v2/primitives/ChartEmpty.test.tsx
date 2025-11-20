import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ChartEmpty } from './ChartEmpty';

describe('ChartEmpty', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChartEmpty />);
    expect(container).toBeTruthy();
  });

  it('displays default no-data message', () => {
    const { getByText } = render(<ChartEmpty variant="no-data" />);
    expect(getByText('No data available')).toBeTruthy();
  });

  it('displays error message', () => {
    const { getByText } = render(<ChartEmpty variant="error" />);
    expect(getByText('Unable to load chart data')).toBeTruthy();
  });

  it('displays filtered message', () => {
    const { getByText } = render(<ChartEmpty variant="filtered" />);
    expect(getByText('No data matches current filters')).toBeTruthy();
  });

  it('displays custom message', () => {
    const { getByText } = render(<ChartEmpty message="Custom empty state" />);
    expect(getByText('Custom empty state')).toBeTruthy();
  });

  it('renders action button when provided', () => {
    const handleClick = vi.fn();
    const { getByText } = render(
      <ChartEmpty
        action={{
          label: 'Upload CSV',
          onClick: handleClick,
        }}
      />
    );

    const button = getByText('Upload CSV');
    expect(button).toBeTruthy();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders without action button by default', () => {
    const { container } = render(<ChartEmpty />);
    const button = container.querySelector('button');

    expect(button).toBeNull();
  });

  it('has ARIA label', () => {
    const { container } = render(<ChartEmpty message="Test message" />);
    const emptyState = container.querySelector('[role="status"]');

    expect(emptyState?.getAttribute('aria-label')).toBe('Test message');
  });

  it('applies custom dimensions', () => {
    const { container } = render(<ChartEmpty width={500} height={300} />);
    expect(container).toBeTruthy();
  });

  it('renders different icons for variants', () => {
    const { container: noData } = render(<ChartEmpty variant="no-data" />);
    expect(noData.querySelector('svg')).toBeTruthy();

    const { container: error } = render(<ChartEmpty variant="error" />);
    expect(error.querySelector('svg')).toBeTruthy();

    const { container: filtered } = render(<ChartEmpty variant="filtered" />);
    expect(filtered.querySelector('svg')).toBeTruthy();
  });
});
