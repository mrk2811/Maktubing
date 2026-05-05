import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterBar from "@/components/FilterBar";

const emptyFilters = {
  gender: "",
  ageMin: "",
  ageMax: "",
  ethnicity: "",
  religiousSect: "",
  maritalStatus: "",
  legalStatus: "",
  residence: "",
};

describe("FilterBar", () => {
  test("renders all filter sections", () => {
    const onChange = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterBar filters={emptyFilters} onFilterChange={onChange} onReset={onReset} />
    );
    expect(screen.getByText("Gender")).toBeInTheDocument();
    expect(screen.getByText("Age Range")).toBeInTheDocument();
    expect(screen.getByText("Sect")).toBeInTheDocument();
    expect(screen.getByText("Marital Status")).toBeInTheDocument();
    expect(screen.getByText("Legal Status")).toBeInTheDocument();
    expect(screen.getByText("Ethnicity")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
  });

  test("renders gender options", () => {
    const onChange = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterBar filters={emptyFilters} onFilterChange={onChange} onReset={onReset} />
    );
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByText("Female")).toBeInTheDocument();
  });

  test("calls onFilterChange when gender is selected", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterBar filters={emptyFilters} onFilterChange={onChange} onReset={onReset} />
    );
    await user.click(screen.getByText("Female"));
    expect(onChange).toHaveBeenCalledWith({ ...emptyFilters, gender: "Female" });
  });

  test("highlights selected gender", () => {
    const onChange = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterBar
        filters={{ ...emptyFilters, gender: "Female" }}
        onFilterChange={onChange}
        onReset={onReset}
      />
    );
    const femaleBtn = screen.getByText("Female");
    expect(femaleBtn).toHaveClass("bg-maktub-green");
  });

  test("shows Clear all button when filters are active", () => {
    const onChange = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterBar
        filters={{ ...emptyFilters, gender: "Female" }}
        onFilterChange={onChange}
        onReset={onReset}
      />
    );
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  test("does not show Clear all when no filters active", () => {
    const onChange = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterBar filters={emptyFilters} onFilterChange={onChange} onReset={onReset} />
    );
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });

  test("calls onReset when Clear all is clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterBar
        filters={{ ...emptyFilters, gender: "Male" }}
        onFilterChange={onChange}
        onReset={onReset}
      />
    );
    await user.click(screen.getByText("Clear all"));
    expect(onReset).toHaveBeenCalled();
  });

  test("shows save input when onSave provided and filters active", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onReset = jest.fn();
    const onSave = jest.fn();
    render(
      <FilterBar
        filters={{ ...emptyFilters, gender: "Female" }}
        onFilterChange={onChange}
        onReset={onReset}
        onSave={onSave}
      />
    );
    const saveBtn = screen.getByText("Save this search");
    await user.click(saveBtn);
    expect(screen.getByPlaceholderText("Name this search...")).toBeInTheDocument();
  });

  test("calls onSave with filter name", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onReset = jest.fn();
    const onSave = jest.fn();
    render(
      <FilterBar
        filters={{ ...emptyFilters, gender: "Female" }}
        onFilterChange={onChange}
        onReset={onReset}
        onSave={onSave}
      />
    );
    await user.click(screen.getByText("Save this search"));
    await user.type(screen.getByPlaceholderText("Name this search..."), "My Filter");
    await user.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith("My Filter");
  });

  test("renders sect radio options", () => {
    const onChange = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterBar filters={emptyFilters} onFilterChange={onChange} onReset={onReset} />
    );
    expect(screen.getByText("Sunni")).toBeInTheDocument();
    expect(screen.getByText("Shia")).toBeInTheDocument();
  });

  test("renders marital status options", () => {
    const onChange = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterBar filters={emptyFilters} onFilterChange={onChange} onReset={onReset} />
    );
    expect(screen.getByText("Divorced")).toBeInTheDocument();
    expect(screen.getByText("Widowed")).toBeInTheDocument();
  });
});
