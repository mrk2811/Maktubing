import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "@/components/Toast";

function TestComponent() {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast("Error message")}>Show Error</button>
      <button onClick={() => showToast("Success!", "success")}>Show Success</button>
      <button onClick={() => showToast("Info!", "info")}>Show Info</button>
    </div>
  );
}

describe("Toast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders toast on showToast call", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText("Show Error"));
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  test("renders success toast with correct styling", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText("Show Success"));
    const toast = screen.getByText("Success!").closest("div");
    expect(toast).toHaveClass("bg-green-50");
  });

  test("renders info toast with correct styling", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText("Show Info"));
    const toast = screen.getByText("Info!").closest("div");
    expect(toast).toHaveClass("bg-blue-50");
  });

  test("auto-dismisses after 5 seconds", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText("Show Error"));
    expect(screen.getByText("Error message")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("Error message")).not.toBeInTheDocument();
  });

  test("can manually dismiss via X button", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText("Show Error"));
    expect(screen.getByText("Error message")).toBeInTheDocument();

    // Find the dismiss button (the X svg button)
    const dismissButtons = screen.getAllByRole("button");
    const xButton = dismissButtons.find(
      (btn) => btn.querySelector("svg") && btn.closest(".pointer-events-auto")
    );
    expect(xButton).toBeTruthy();
    await user.click(xButton!);

    expect(screen.queryByText("Error message")).not.toBeInTheDocument();
  });

  test("stacks multiple toasts", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText("Show Error"));
    await user.click(screen.getByText("Show Success"));

    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("Success!")).toBeInTheDocument();
  });
});
