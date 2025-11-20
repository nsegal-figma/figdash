import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ChartLoading } from './ChartLoading';

describe('ChartLoading', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChartLoading />);
    expect(container).toBeTruthy();
  });

  it('has ARIA attributes for accessibility', () => {
    const { container } = render(<ChartLoading />);
    const loading = container.querySelector('[role="status"]');

    expect(loading).toBeTruthy();
    expect(loading?.getAttribute('aria-busy')).toBe('true');
    expect(loading?.getAttribute('aria-live')).toBe('polite');
  });

  it('displays loading message', () => {
    const { getByText } = render(<ChartLoading />);
    expect(getByText('Loading chart...')).toBeTruthy();
  });

  it('applies custom width and height', () => {
    const { container } = render(<ChartLoading width={600} height={300} />);
    expect(container).toBeTruthy();
  });

  it('renders different variants', () => {
    const { rerender, container } = render(<ChartLoading variant="bar" />);
    expect(container).toBeTruthy();

    rerender(<ChartLoading variant="line" />);
    expect(container).toBeTruthy();

    rerender(<ChartLoading variant="pie" />);
    expect(container).toBeTruthy();
  });
});
