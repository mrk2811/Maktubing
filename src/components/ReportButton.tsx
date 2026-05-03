"use client";

import { useState } from "react";
import { useReports, ReportReason } from "@/lib/useReports";

const CURRENT_USER_ID = "current-user";

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "fake_profile", label: "Fake Profile" },
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

export default function ReportButton({ profileId }: { profileId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { submitReport, hasReported } = useReports();

  const alreadyReported = hasReported(profileId, CURRENT_USER_ID);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    const success = await submitReport({
      profileId,
      reporterId: CURRENT_USER_ID,
      reason: selectedReason,
      details,
    });
    if (success) {
      setSubmitted(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
        setSelectedReason(null);
        setDetails("");
      }, 1500);
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  if (alreadyReported) {
    return (
      <span className="text-xs text-maktub-text-secondary italic">
        Reported
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-sm text-maktub-text-secondary hover:text-red-500 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        Report
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!submitted) setShowModal(false);
          }}
        >
          <div
            className="bg-maktub-panel rounded-2xl border border-maktub-border w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-maktub-green/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-maktub-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="font-medium text-maktub-text">Report Submitted</p>
                <p className="text-sm text-maktub-text-secondary mt-1">
                  Thank you. Our team will review this profile.
                </p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-maktub-border">
                  <h2 className="text-lg font-semibold text-maktub-text">
                    Report Profile
                  </h2>
                  <p className="text-sm text-maktub-text-secondary mt-0.5">
                    Help us keep Maktub safe and trustworthy
                  </p>
                </div>

                <div className="px-6 py-4 space-y-3">
                  <p className="text-sm font-medium text-maktub-text">
                    Why are you reporting this profile?
                  </p>
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedReason === reason.value
                          ? "border-maktub-green bg-maktub-green/5"
                          : "border-maktub-border hover:border-maktub-green/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={() => setSelectedReason(reason.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedReason === reason.value
                            ? "border-maktub-green"
                            : "border-maktub-border"
                        }`}
                      >
                        {selectedReason === reason.value && (
                          <div className="w-2 h-2 rounded-full bg-maktub-green" />
                        )}
                      </div>
                      <span className="text-sm text-maktub-text">
                        {reason.label}
                      </span>
                    </label>
                  ))}

                  {selectedReason && (
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Additional details (optional)"
                      className="w-full mt-3 px-4 py-3 bg-maktub-input border border-maktub-border rounded-lg text-sm text-maktub-text placeholder:text-maktub-text-secondary/60 resize-none focus:outline-none focus:border-maktub-green"
                      rows={3}
                    />
                  )}
                </div>

                <div className="px-6 py-4 border-t border-maktub-border flex gap-3 justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-maktub-text-secondary hover:text-maktub-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedReason}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
