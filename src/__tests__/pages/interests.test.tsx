import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InterestsPage from "@/app/interests/page";
import { ToastProvider } from "@/components/Toast";

const mockProfiles = [
  {
    id: "p1",
    name: "Fatima Khan",
    gender: "Female" as const,
    age: 27,
    height: "5'4\"",
    residence: "New York, NY",
    relocate: "Open",
    education: "Master's",
    profession: "Doctor",
    legalStatus: "US Citizen",
    maritalStatus: "Never Married",
    children: "None",
    ethnicity: "Pakistani",
    religiousSect: "Sunni",
    languages: ["English"],
    lookingFor: { ageRange: "", height: "", ethnicity: "", residence: "", legalStatus: "", maritalStatus: "", religiousSect: "" },
    comments: "",
    aboutMe: "",
    contactName: "Parent",
    contactPhone: "+1",
    createdAt: "2026-01-01",
    verified: true,
    phoneVerified: true,
    adminVerified: true,
  },
];

const mockFetchProfiles = jest.fn().mockResolvedValue(mockProfiles);

const mockSentInterests = jest.fn().mockReturnValue([
  { fromProfileId: "current-user", toProfileId: "p1", status: "pending" as const, createdAt: "2026-01-01" },
]);
const mockReceivedInterests = jest.fn().mockReturnValue([
  { fromProfileId: "p1", toProfileId: "current-user", status: "pending" as const, createdAt: "2026-01-01" },
]);
const mockUpdateStatus = jest.fn();
const mockAddNotification = jest.fn();

jest.mock("@/lib/db", () => ({
  fetchProfiles: (...args: unknown[]) => mockFetchProfiles(...args),
}));

jest.mock("@/lib/useInterests", () => ({
  useInterests: () => ({
    interests: [],
    sendInterest: jest.fn(),
    updateStatus: mockUpdateStatus,
    getInterestStatus: jest.fn().mockReturnValue(null),
    sentInterests: mockSentInterests,
    receivedInterests: mockReceivedInterests,
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

jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/interests"),
  useRouter: jest.fn().mockReturnValue({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock("next/image", () => {
  return function MockImage(props: Record<string, unknown>) {
    return <img {...props} />;
  };
});

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("InterestsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchProfiles.mockResolvedValue(mockProfiles);
  });

  test("renders page title and tabs", () => {
    renderWithProviders(<InterestsPage />);
    expect(screen.getByText("Interests")).toBeInTheDocument();
    expect(screen.getByText("Track interest sent and received")).toBeInTheDocument();
  });

  test("shows sent tab by default with count", () => {
    renderWithProviders(<InterestsPage />);
    expect(screen.getByText("Sent (1)")).toBeInTheDocument();
    expect(screen.getByText("Received (1)")).toBeInTheDocument();
  });

  test("shows skeleton while loading", () => {
    mockFetchProfiles.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<InterestsPage />);
    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  test("displays sent interests with profile info", async () => {
    renderWithProviders(<InterestsPage />);
    await waitFor(() => {
      expect(screen.getByText("Fatima Khan")).toBeInTheDocument();
    });
  });

  test("switches to received tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InterestsPage />);
    await waitFor(() => {
      expect(screen.getByText("Fatima Khan")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Received (1)"));
    // Should show received interests
    await waitFor(() => {
      expect(screen.getByText("Fatima Khan")).toBeInTheDocument();
    });
  });

  test("shows accept/decline buttons for received interests", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InterestsPage />);
    await waitFor(() => {
      expect(screen.getByText("Fatima Khan")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Received (1)"));
    await waitFor(() => {
      expect(screen.getByText("Accept")).toBeInTheDocument();
      expect(screen.getByText("Decline")).toBeInTheDocument();
    });
  });

  test("calls updateStatus and addNotification on accept", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InterestsPage />);
    await waitFor(() => {
      expect(screen.getByText("Fatima Khan")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Received (1)"));
    await waitFor(() => {
      expect(screen.getByText("Accept")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Accept"));
    expect(mockUpdateStatus).toHaveBeenCalledWith("p1", "current-user", "accepted");
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: "interest_accepted",
      fromProfileId: "current-user",
      toProfileId: "p1",
    });
  });

  test("calls updateStatus and addNotification on decline", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InterestsPage />);
    await waitFor(() => {
      expect(screen.getByText("Fatima Khan")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Received (1)"));
    await waitFor(() => {
      expect(screen.getByText("Decline")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Decline"));
    expect(mockUpdateStatus).toHaveBeenCalledWith("p1", "current-user", "declined");
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: "interest_declined",
      fromProfileId: "current-user",
      toProfileId: "p1",
    });
  });

  test("shows error toast on fetch failure", async () => {
    mockFetchProfiles.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<InterestsPage />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load interests.")).toBeInTheDocument();
    });
  });

  test("shows empty state when no sent interests", async () => {
    mockSentInterests.mockReturnValue([]);
    renderWithProviders(<InterestsPage />);
    await waitFor(() => {
      expect(screen.getByText("No interests sent yet")).toBeInTheDocument();
    });
  });
});
