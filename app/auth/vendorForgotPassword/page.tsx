import { Metadata } from "next";
import { VendorForgotPasswordClient } from "./VendorForgotPasswordClient";

export const metadata: Metadata = {
  title: "Vendor Forgot Password",
  description: "Reset your techsonance vendor marketplace password",
};

export default function Page() {
  return <VendorForgotPasswordClient />;
}
