"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dot,
  Edit,
  Landmark,
  AlertCircle,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { billingSchema, BillingFormData } from "@/utils/validation";

export default function BillingAndBankingPage() {
  return (
    <main className={`w-full mx-auto mt-6 `}>
      <h1>Billing and Banking</h1>
      <p>for subscription management and Banking details</p>
      <p>Coming Soon...</p>
    </main>
  );
}
