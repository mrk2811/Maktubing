"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

type Step = "phone" | "otp" | "success";

export default function VerifyPhonePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setStep("otp");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      setStep("success");
      setTimeout(() => {
        router.push("/profiles");
      }, 2500);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col justify-center">
        {step === "phone" && (
          <div className="bg-maktub-panel rounded-2xl border border-maktub-border p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-maktub-green/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-maktub-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-maktub-text">
                Verify Your Phone
              </h1>
              <p className="text-sm text-maktub-text-secondary mt-1">
                We&apos;ll send a 6-digit code to verify your number
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit}>
              <div className="flex flex-col gap-2 mb-6">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-maktub-text-secondary"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 347-341-0176"
                  className="bg-maktub-input text-maktub-text rounded-lg px-4 py-3 border border-maktub-border focus:border-maktub-green focus:outline-none placeholder:text-maktub-text-secondary/50 text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-maktub-green text-white font-medium py-3 rounded-lg hover:bg-maktub-green/90 transition-colors"
              >
                Send Verification Code
              </button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div className="bg-maktub-panel rounded-2xl border border-maktub-border p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-maktub-green/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-maktub-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-maktub-text">
                Enter Verification Code
              </h1>
              <p className="text-sm text-maktub-text-secondary mt-1">
                Code sent to {phone}
              </p>
            </div>

            <form onSubmit={handleOtpSubmit}>
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-13 text-center text-lg font-bold bg-maktub-input text-maktub-text rounded-lg border border-maktub-border focus:border-maktub-green focus:outline-none"
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={otp.join("").length !== 6}
                className="w-full bg-maktub-green text-white font-medium py-3 rounded-lg hover:bg-maktub-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full mt-3 text-sm text-maktub-text-secondary hover:text-maktub-text transition-colors"
              >
                Change phone number
              </button>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="bg-maktub-panel rounded-2xl border border-maktub-border p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-maktub-green/20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-maktub-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-maktub-text mb-2">
              Phone Verified!
            </h2>
            <p className="text-maktub-text-secondary">
              Your phone number has been verified successfully.
              <br />
              Redirecting to profiles...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
