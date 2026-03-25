import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import QuantitySelector from '@/components/QuantitySelector';

afterEach(() => {
  cleanup();
});

function QuantityHarness({
  initialValue,
  min,
  max,
  onChange,
}: {
  initialValue: number;
  min: number;
  max: number;
  onChange?: (value: number) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <QuantitySelector
      value={value}
      min={min}
      max={max}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange?.(nextValue);
      }}
    />
  );
}

describe('QuantitySelector', () => {
  it('decreases and increases the value within bounds', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<QuantityHarness initialValue={2} onChange={onChange} min={1} max={3} />);

    const [decreaseButton, increaseButton] = screen.getAllByRole('button');
    await user.click(decreaseButton);
    await user.click(increaseButton);

    expect(onChange).toHaveBeenNthCalledWith(1, 1);
    expect(onChange).toHaveBeenNthCalledWith(2, 2);
  });

  it('disables the decrease button at the minimum', () => {
    render(<QuantityHarness initialValue={1} min={1} max={3} />);

    const [decreaseButton] = screen.getAllByRole('button');
    expect(decreaseButton).toBeDisabled();
  });

  it('disables the increase button at the maximum', () => {
    render(<QuantityHarness initialValue={3} min={1} max={3} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toBeDisabled();
  });

  it('accepts typed values within the configured range', () => {
    const onChange = vi.fn();

    const { container } = render(
      <QuantityHarness initialValue={2} onChange={onChange} min={1} max={5} />
    );

    const input = container.querySelector('input[type="number"]');
    if (!input) {
      throw new Error('Quantity input not found');
    }

    fireEvent.change(input, { target: { value: '4' } });

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('ignores typed values outside the configured range', () => {
    const onChange = vi.fn();

    const { container } = render(
      <QuantityHarness initialValue={2} onChange={onChange} min={1} max={3} />
    );

    const input = container.querySelector('input[type="number"]');
    if (!input) {
      throw new Error('Quantity input not found');
    }

    fireEvent.change(input, { target: { value: '7' } });

    expect(onChange).not.toHaveBeenCalledWith(7);
  });
});
