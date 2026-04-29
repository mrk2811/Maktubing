"use client";

import { FilterOptions } from "@/lib/types";

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
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
      <label className="text-xs text-maktub-text-secondary font-medium">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-maktub-input text-maktub-text text-sm rounded-lg px-3 py-2 border border-maktub-border focus:border-maktub-green focus:outline-none appearance-none cursor-pointer"
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

  return (
    <div className="bg-maktub-panel rounded-2xl p-4 border border-maktub-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-maktub-text">
          Filter Profiles
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-maktub-green hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <SelectField
          label="Gender"
          value={filters.gender}
          onChange={(v) => update("gender", v)}
          options={[
            { value: "", label: "Any" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
        />
        <SelectField
          label="Min Age"
          value={filters.ageMin}
          onChange={(v) => update("ageMin", v)}
          options={[
            { value: "", label: "Any" },
            ...Array.from({ length: 30 }, (_, i) => ({
              value: String(18 + i),
              label: String(18 + i),
            })),
          ]}
        />
        <SelectField
          label="Max Age"
          value={filters.ageMax}
          onChange={(v) => update("ageMax", v)}
          options={[
            { value: "", label: "Any" },
            ...Array.from({ length: 30 }, (_, i) => ({
              value: String(18 + i),
              label: String(18 + i),
            })),
          ]}
        />
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
            { value: "Turkish", label: "Turkish" },
            { value: "Other", label: "Other" },
          ]}
        />
        <SelectField
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
        <SelectField
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
          ]}
        />
      </div>
    </div>
  );
}
