'use client';

import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (value > min) onChange(value - 1);
  };

  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-lg">
      <button
        onClick={decrease}
        className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
        disabled={value <= min}
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value, 10);
          if (!isNaN(newValue) && newValue >= min && newValue <= max) {
            onChange(newValue);
          }
        }}
        className="flex-1 text-center py-2 focus:outline-none w-12"
        min={min}
        max={max}
      />
      <button
        onClick={increase}
        className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
        disabled={value >= max}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
