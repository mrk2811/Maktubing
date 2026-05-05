import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SaveButton from "@/components/SaveButton";
import { ToastProvider } from "@/components/Toast";

const mockToggleSave = jest.fn();
const mockIsSaved = jest.fn();

jest.mock("@/lib/useSavedProfiles", () => ({
  useSavedProfiles: () => ({
    savedIds: [],
    toggleSave: mockToggleSave,
    isSaved: mockIsSaved,
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("SaveButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSaved.mockReturnValue(false);
    mockToggleSave.mockResolvedValue(undefined);
  });

  test("renders unsaved state", () => {
    renderWithProviders(<SaveButton profileId="p1" />);
    expect(screen.getByLabelText("Save profile")).toBeInTheDocument();
  });

  test("renders saved state", () => {
    mockIsSaved.mockReturnValue(true);
    renderWithProviders(<SaveButton profileId="p1" />);
    expect(screen.getByLabelText("Unsave profile")).toBeInTheDocument();
  });

  test("calls toggleSave on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SaveButton profileId="p1" />);
    await user.click(screen.getByRole("button"));
    expect(mockToggleSave).toHaveBeenCalledWith("p1");
  });

  test("shows toast on error", async () => {
    mockToggleSave.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    renderWithProviders(<SaveButton profileId="p1" />);
    await user.click(screen.getByRole("button"));
    expect(await screen.findByText("Failed to save profile.")).toBeInTheDocument();
  });

  test("renders small size variant", () => {
    const { container } = renderWithProviders(<SaveButton profileId="p1" size="sm" />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("w-8", "h-8");
  });
});
