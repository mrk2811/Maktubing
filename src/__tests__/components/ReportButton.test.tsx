import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportButton from "@/components/ReportButton";
import { ToastProvider } from "@/components/Toast";

const mockSubmitReport = jest.fn();
const mockHasReported = jest.fn();

jest.mock("@/lib/useReports", () => ({
  useReports: () => ({
    reports: [],
    pendingReports: [],
    submitReport: mockSubmitReport,
    updateReportStatus: jest.fn(),
    hasReported: mockHasReported,
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("ReportButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasReported.mockReturnValue(false);
    mockSubmitReport.mockResolvedValue(true);
  });

  test("renders Report button", () => {
    renderWithProviders(<ReportButton profileId="p1" />);
    expect(screen.getByText("Report")).toBeInTheDocument();
  });

  test("shows 'Reported' when already reported", () => {
    mockHasReported.mockReturnValue(true);
    renderWithProviders(<ReportButton profileId="p1" />);
    expect(screen.getByText("Reported")).toBeInTheDocument();
    expect(screen.queryByText("Report")).not.toBeInTheDocument();
  });

  test("opens modal on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportButton profileId="p1" />);
    await user.click(screen.getByText("Report"));
    expect(screen.getByText("Report Profile")).toBeInTheDocument();
    expect(screen.getByText("Why are you reporting this profile?")).toBeInTheDocument();
  });

  test("shows all report reasons", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportButton profileId="p1" />);
    await user.click(screen.getByText("Report"));
    expect(screen.getByText("Fake Profile")).toBeInTheDocument();
    expect(screen.getByText("Inappropriate Content")).toBeInTheDocument();
    expect(screen.getByText("Spam")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  test("submits report with selected reason", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportButton profileId="p1" />);

    await user.click(screen.getByText("Report"));
    await user.click(screen.getByText("Spam"));
    await user.click(screen.getByText("Submit Report"));

    expect(mockSubmitReport).toHaveBeenCalledWith({
      profileId: "p1",
      reporterId: "current-user",
      reason: "spam",
      details: "",
    });
  });

  test("shows toast on submit error", async () => {
    mockSubmitReport.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    renderWithProviders(<ReportButton profileId="p1" />);

    await user.click(screen.getByText("Report"));
    await user.click(screen.getByText("Spam"));
    await user.click(screen.getByText("Submit Report"));

    expect(
      await screen.findByText("Failed to submit report. Please try again.")
    ).toBeInTheDocument();
  });
});
