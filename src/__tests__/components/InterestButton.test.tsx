import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InterestButton from "@/components/InterestButton";
import { ToastProvider } from "@/components/Toast";

const mockSendInterest = jest.fn();
const mockGetInterestStatus = jest.fn();
const mockAddNotification = jest.fn();

jest.mock("@/lib/useInterests", () => ({
  useInterests: () => ({
    interests: [],
    sendInterest: mockSendInterest,
    updateStatus: jest.fn(),
    getInterestStatus: mockGetInterestStatus,
    sentInterests: jest.fn().mockReturnValue([]),
    receivedInterests: jest.fn().mockReturnValue([]),
  }),
}));

jest.mock("@/lib/useNotifications", () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    addNotification: mockAddNotification,
    markAllRead: jest.fn(),
    markRead: jest.fn(),
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("InterestButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInterestStatus.mockReturnValue(null);
    mockSendInterest.mockResolvedValue(undefined);
    mockAddNotification.mockResolvedValue(undefined);
  });

  test("renders Send Interest button when no status", () => {
    renderWithProviders(<InterestButton profileId="p1" />);
    expect(screen.getByText("Send Interest")).toBeInTheDocument();
  });

  test("renders Interest Sent when pending", () => {
    mockGetInterestStatus.mockReturnValue("pending");
    renderWithProviders(<InterestButton profileId="p1" />);
    expect(screen.getByText("Interest Sent")).toBeInTheDocument();
  });

  test("renders Accepted when accepted", () => {
    mockGetInterestStatus.mockReturnValue("accepted");
    renderWithProviders(<InterestButton profileId="p1" />);
    expect(screen.getByText("Accepted")).toBeInTheDocument();
  });

  test("renders Declined when declined", () => {
    mockGetInterestStatus.mockReturnValue("declined");
    renderWithProviders(<InterestButton profileId="p1" />);
    expect(screen.getByText("Declined")).toBeInTheDocument();
  });

  test("sends interest and notification on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InterestButton profileId="p1" />);

    await user.click(screen.getByText("Send Interest"));
    expect(mockSendInterest).toHaveBeenCalledWith("current-user", "p1");
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: "interest_received",
      fromProfileId: "current-user",
      toProfileId: "p1",
    });
  });

  test("shows toast on error", async () => {
    mockSendInterest.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    renderWithProviders(<InterestButton profileId="p1" />);

    await user.click(screen.getByText("Send Interest"));
    expect(
      await screen.findByText("Failed to send interest. Please try again.")
    ).toBeInTheDocument();
  });

  test("does not send if status already exists", async () => {
    mockGetInterestStatus.mockReturnValue("pending");
    renderWithProviders(<InterestButton profileId="p1" />);
    // No button to click — it's a span now
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
