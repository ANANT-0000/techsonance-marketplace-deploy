import { Metadata } from "next";
import VerifyEmailClient from "./VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify Email | Techsonance Marketplace",
  description: "Verify your email address to access the vendor dashboard.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
