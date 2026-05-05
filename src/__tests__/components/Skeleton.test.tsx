import React from "react";
import { render, screen } from "@testing-library/react";
import {
  ProfileGridSkeleton,
  ProfileDetailSkeleton,
  InterestListSkeleton,
  NotificationListSkeleton,
} from "@/components/Skeleton";

describe("Skeleton Components", () => {
  test("ProfileGridSkeleton renders default 6 skeleton cards", () => {
    const { container } = render(<ProfileGridSkeleton />);
    const cards = container.querySelectorAll(".animate-pulse");
    expect(cards.length).toBeGreaterThanOrEqual(6);
  });

  test("ProfileGridSkeleton renders custom count", () => {
    const { container } = render(<ProfileGridSkeleton count={3} />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    // Should have 3 skeleton cards
    const cards = grid!.children;
    expect(cards.length).toBe(3);
  });

  test("ProfileDetailSkeleton renders", () => {
    const { container } = render(<ProfileDetailSkeleton />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  test("InterestListSkeleton renders", () => {
    const { container } = render(<InterestListSkeleton />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  test("NotificationListSkeleton renders", () => {
    const { container } = render(<NotificationListSkeleton />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
