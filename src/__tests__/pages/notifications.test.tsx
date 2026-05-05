import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import NotificationsPage from "@/app/notifications/page";
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
const mockMarkAllRead = jest.fn();

let mockNotifications = [
  {
    id: "n1",
    type: "interest_received" as const,
    fromProfileId: "p1",
    toProfileId: "current-user",
    read: false,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "n2",
    type: "interest_accepted" as const,
    fromProfileId: "p1",
    toProfileId: "current-user",
    read: true,
    createdAt: "2026-01-02T00:00:00Z",
  },
];

jest.mock("@/lib/db", () => ({
  fetchProfiles: (...args: unknown[]) => mockFetchProfiles(...args),
}));

jest.mock("@/lib/useNotifications", () => ({
  useNotifications: () => ({
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter((n) => !n.read).length,
    addNotification: jest.fn(),
    markAllRead: mockMarkAllRead,
    markRead: jest.fn(),
  }),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/notifications"),
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

describe("NotificationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchProfiles.mockResolvedValue(mockProfiles);
    mockNotifications = [
      {
        id: "n1",
        type: "interest_received" as const,
        fromProfileId: "p1",
        toProfileId: "current-user",
        read: false,
        createdAt: "2026-01-01T00:00:00Z",
      },
      {
        id: "n2",
        type: "interest_accepted" as const,
        fromProfileId: "p1",
        toProfileId: "current-user",
        read: true,
        createdAt: "2026-01-02T00:00:00Z",
      },
    ];
  });

  test("renders page title", () => {
    renderWithProviders(<NotificationsPage />);
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Stay updated on interest activity")).toBeInTheDocument();
  });

  test("shows skeleton while loading", () => {
    mockFetchProfiles.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<NotificationsPage />);
    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  test("displays notification messages after loading", async () => {
    renderWithProviders(<NotificationsPage />);
    await waitFor(() => {
      // Profile name in strong tag + surrounding text
      expect(screen.getAllByText("Fatima Khan").length).toBeGreaterThanOrEqual(1);
    });
    // Check notification types are rendered
    expect(screen.getByText(/sent you interest/i)).toBeInTheDocument();
    expect(screen.getByText(/accepted your interest/i)).toBeInTheDocument();
  });

  test("marks unread notifications as read", () => {
    renderWithProviders(<NotificationsPage />);
    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  test("does not call markAllRead when all are read", () => {
    mockNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
    renderWithProviders(<NotificationsPage />);
    expect(mockMarkAllRead).not.toHaveBeenCalled();
  });

  test("shows empty state when no notifications", async () => {
    mockNotifications = [];
    renderWithProviders(<NotificationsPage />);
    await waitFor(() => {
      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    });
  });

  test("shows error toast on fetch failure", async () => {
    mockFetchProfiles.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<NotificationsPage />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load notifications.")).toBeInTheDocument();
    });
  });
});
