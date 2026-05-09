"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  initRecaptcha,
  sendCode,
  verifyCode,
  cleanupRecaptcha,
} from "@/lib/phoneVerification";
import { linkFirebaseAuth } from "@/lib/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthProvider";

type Step = "phone" | "otp" | "success";

export default function LoginPage() {
  const router = useRouter();
  const { isPhoneVerified } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPhoneVerified) {
      router.replace("/");
    }
  }, [isPhoneVerified, router]);

  useEffect(() => {
    initRecaptcha("send-code-btn");
    return () => {
      cleanupRecaptcha();
    };
  }, []);

  const handlePhoneSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (phone.length < 10) return;

      setError("");
      setLoading(true);

      try {
        const formatted = phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "")}`;
        await sendCode(formatted);
        setStep("otp");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to send code";
        if (message.includes("too-many-requests")) {
          setError("Too many attempts. Please try again later.");
        } else if (message.includes("invalid-phone-number")) {
          setError("Invalid phone number. Please include country code (e.g. +1...)");
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    },
    [phone]
  );

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

  const handleOtpSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const code = otp.join("");
      if (code.length !== 6) return;

      setError("");
      setLoading(true);

      try {
        const valid = await verifyCode(code);
        if (valid) {
          try {
            const user = firebaseAuth.currentUser;
            if (user) {
              const idToken = await user.getIdToken();
              await linkFirebaseAuth(idToken);
            }
          } catch {
            // non-critical: linking to Supabase failed but auth still succeeded
          }
          setStep("success");
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          setError("Invalid code. Please try again.");
        }
      } catch {
        setError("Verification failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [otp, router]
  );

  if (isPhoneVerified) return null;

  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col justify-center">
        {step === "phone" && (
          <div className="bg-maktub-panel rounded-2xl border border-maktub-border p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-maktub-green/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-maktub-green">M</span>
              </div>
              <h1 className="text-xl font-bold text-maktub-text">
                Sign in to Maktub
              </h1>
              <p className="text-sm text-maktub-text-secondary mt-1">
                Enter your phone number to sign in or create an account
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit}>
              <div className="flex flex-col gap-2 mb-4">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-maktub-text-secondary"
                >
                  Phone Number (with country code)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 347-341-0176"
                  className="bg-maktub-input text-maktub-text rounded-lg px-4 py-3 border border-maktub-border focus:border-maktub-green focus:outline-none placeholder:text-maktub-text-secondary/50 text-sm"
                  required
                />
                <p className="text-xs text-maktub-text-secondary">
                  Include your country code (e.g. +1 for US, +44 for UK, +92 for Pakistan)
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500 mb-4">{error}</p>
              )}

              <button
                id="send-code-btn"
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-maktub-green text-white font-medium py-3 rounded-lg hover:bg-maktub-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Continue"}
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
              <div className="flex justify-center gap-2 mb-4">
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

              {error && (
                <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="w-full bg-maktub-green text-white font-medium py-3 rounded-lg hover:bg-maktub-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp(["", "", "", "", "", ""]);
                  setError("");
                }}
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
              Welcome to Maktub!
            </h2>
            <p className="text-maktub-text-secondary">
              You&apos;re signed in. Redirecting...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
