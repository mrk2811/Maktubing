"use client";

import { useCallback } from "react";
import { FilterOptions } from "@/lib/types";

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

function RadioGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-maktub-text-secondary font-medium">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              value === opt.value
                ? "bg-maktub-green text-white shadow-sm"
                : "bg-maktub-input text-maktub-text-secondary border border-maktub-border hover:border-maktub-green/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const AGE_MIN = 18;
const AGE_MAX = 65;

function RangeSlider({
  label,
  minValue,
  maxValue,
  onChange,
}: {
  label: string;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
}) {
  const range = AGE_MAX - AGE_MIN;
  const minPercent = ((minValue - AGE_MIN) / range) * 100;
  const maxPercent = ((maxValue - AGE_MIN) / range) * 100;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(Number(e.target.value), maxValue - 1);
      onChange(val, maxValue);
    },
    [maxValue, onChange]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), minValue + 1);
      onChange(minValue, val);
    },
    [minValue, onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-maktub-text-secondary font-medium">
          {label}
        </span>
        <span className="text-sm font-semibold text-maktub-green">
          {minValue} – {maxValue}
        </span>
      </div>
      <div className="relative h-10 flex items-center">
        {/* Track background */}
        <div className="absolute left-0 right-0 h-2 bg-maktub-input rounded-full" />
        {/* Active range highlight */}
        <div
          className="absolute h-2 bg-maktub-green/40 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        {/* Min handle */}
        <input
          type="range"
          min={AGE_MIN}
          max={AGE_MAX}
          value={minValue}
          onChange={handleMinChange}
          className="range-slider absolute w-full pointer-events-none appearance-none bg-transparent z-10"
          style={{ height: "40px" }}
        />
        {/* Max handle */}
        <input
          type="range"
          min={AGE_MIN}
          max={AGE_MAX}
          value={maxValue}
          onChange={handleMaxChange}
          className="range-slider absolute w-full pointer-events-none appearance-none bg-transparent z-20"
          style={{ height: "40px" }}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-maktub-text-secondary font-medium">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-maktub-input text-maktub-text text-base rounded-lg px-3 py-2.5 border border-maktub-border focus:border-maktub-green focus:outline-none appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function FilterBar({
  filters,
  onFilterChange,
  onReset,
}: FilterBarProps) {
  const update = (key: keyof FilterOptions, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const ageMin = filters.ageMin ? parseInt(filters.ageMin) : AGE_MIN;
  const ageMax = filters.ageMax ? parseInt(filters.ageMax) : AGE_MAX;

  return (
    <div className="bg-maktub-panel rounded-2xl p-5 border border-maktub-border">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-maktub-text">
          Filter Profiles
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-maktub-green hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Gender - Radio */}
        <RadioGroup
          label="Gender"
          value={filters.gender}
          onChange={(v) => update("gender", v)}
          options={[
            { value: "", label: "Any" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
        />

        {/* Age - Range Slider */}
        <RangeSlider
          label="Age Range"
          minValue={ageMin}
          maxValue={ageMax}
          onChange={(min, max) => {
            onFilterChange({
              ...filters,
              ageMin: min === AGE_MIN ? "" : String(min),
              ageMax: max === AGE_MAX ? "" : String(max),
            });
          }}
        />

        {/* Marital Status - Radio */}
        <RadioGroup
          label="Marital Status"
          value={filters.maritalStatus}
          onChange={(v) => update("maritalStatus", v)}
          options={[
            { value: "", label: "Any" },
            { value: "Single", label: "Single" },
            { value: "Divorced", label: "Divorced" },
            { value: "Widowed", label: "Widowed" },
          ]}
        />

        {/* Sect - Radio */}
        <RadioGroup
          label="Sect"
          value={filters.religiousSect}
          onChange={(v) => update("religiousSect", v)}
          options={[
            { value: "", label: "Any" },
            { value: "Sunni", label: "Sunni" },
            { value: "Shia", label: "Shia" },
            { value: "Other", label: "Other" },
          ]}
        />

        {/* Dropdowns row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectField
            label="Ethnicity"
            value={filters.ethnicity}
            onChange={(v) => update("ethnicity", v)}
            options={[
              { value: "", label: "Any" },
              { value: "Pakistani", label: "Pakistani" },
              { value: "Indian", label: "Indian" },
              { value: "Bengali", label: "Bengali" },
              { value: "Arab", label: "Arab" },
              { value: "Somali", label: "Somali" },
              { value: "Afghan", label: "Afghan" },
              { value: "Turkish", label: "Turkish" },
              { value: "African American", label: "African American" },
              { value: "Other", label: "Other" },
            ]}
          />
          <SelectField
            label="Legal Status"
            value={filters.legalStatus}
            onChange={(v) => update("legalStatus", v)}
            options={[
              { value: "", label: "Any" },
              { value: "US Citizen", label: "US Citizen" },
              { value: "Green Card", label: "Green Card" },
              { value: "Pending", label: "Pending" },
              { value: "Work Visa", label: "Work Visa" },
            ]}
          />
          <SelectField
            label="Location"
            value={filters.residence}
            onChange={(v) => update("residence", v)}
            options={[
              { value: "", label: "Anywhere" },
              { value: "New York", label: "New York" },
              { value: "Chicago", label: "Chicago" },
              { value: "Texas", label: "Texas" },
              { value: "California", label: "California" },
              { value: "New Jersey", label: "New Jersey" },
              { value: "Toronto", label: "Toronto" },
              { value: "London", label: "London" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
