/**
 * Phone verification abstraction layer.
 * Currently uses Firebase Phone Auth.
 * To switch to Twilio later, replace the implementation in this file only.
 */

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialize the reCAPTCHA verifier (required by Firebase Phone Auth).
 * Must be called once before sendCode, attaching to a DOM element.
 */
export function initRecaptcha(buttonId: string): void {
  if (typeof window === "undefined") return;
  if (recaptchaVerifier) return;

  recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: "invisible",
  });
}

/**
 * Send a verification code to the given phone number.
 * Returns true on success, throws on failure.
 */
export async function sendCode(phoneNumber: string): Promise<boolean> {
  if (!recaptchaVerifier) {
    throw new Error("reCAPTCHA not initialized. Call initRecaptcha first.");
  }

  confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    recaptchaVerifier
  );
  return true;
}

/**
 * Verify the code entered by the user.
 * Returns true if valid, false if invalid.
 */
export async function verifyCode(code: string): Promise<boolean> {
  if (!confirmationResult) {
    throw new Error("No verification in progress. Call sendCode first.");
  }

  try {
    await confirmationResult.confirm(code);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean up reCAPTCHA verifier (call on unmount).
 */
export function cleanupRecaptcha(): void {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  confirmationResult = null;
}
