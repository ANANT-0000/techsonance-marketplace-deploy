"use client";
import { useSearchParams } from "next/navigation";
import SegmentForm from "@/components/vendor/SegmentForm";
import { SEGMENT_FORM_TEXT } from "@/constants/vendorText";

export default function NewSegmentPage() {
  const searchParams = useSearchParams();
  const segmentId = searchParams.get("segmentId");
  return (
    <div className="w-full p-6   mx-auto">
      <h1 className="text-theme-h4 font-bold text-gray-800 mb-1">
        {segmentId ? SEGMENT_FORM_TEXT.HEADER.EDIT_WRAPPER : SEGMENT_FORM_TEXT.HEADER.CREATE_WRAPPER}
      </h1>
      <p className="text-theme-body-sm text-gray-500 mb-6">
        {SEGMENT_FORM_TEXT.HEADER.WRAPPER_DESC}
      </p>
      <SegmentForm segmentId={segmentId} />
    </div>
  );
}