"use client";
import { useSearchParams } from "next/navigation";
import SegmentForm from "@/components/vendor/SegmentForm";
import { SEGMENT_FORM_TEXT } from "@/constants/vendorText";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function NewSegmentPageContent() {
  const searchParams = useSearchParams();
  const segmentId = searchParams.get("segmentId");
  return (
    <div className="w-full p-6   mx-auto">
      <h1 className="text-theme-h4 font-bold text-gray-800 mb-1">
        {segmentId
          ? SEGMENT_FORM_TEXT.HEADER.EDIT_WRAPPER
          : SEGMENT_FORM_TEXT.HEADER.CREATE_WRAPPER}
      </h1>
      <p className="text-theme-body-sm text-gray-500 mb-6">
        {SEGMENT_FORM_TEXT.HEADER.WRAPPER_DESC}
      </p>
      <SegmentForm segmentId={segmentId} />
    </div>
  );
}

export default function NewSegmentPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center">
          <Loader2 className="animate-spin mx-auto text-blue-600" />
        </div>
      }
    >
      <NewSegmentPageContent />
    </Suspense>
  );
}
