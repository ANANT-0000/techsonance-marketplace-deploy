"use client";
import { useSearchParams} from "next/navigation";
import SegmentForm from "@/components/vendor/SegmentForm";

 
export default function NewSegmentPage() {
 const searchParams = useSearchParams();
 const segmentId = searchParams.get("segmentId");
  console.log("segmentId from search params:", segmentId)??'';
  return (
    <div className="w-full p-6   mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">{segmentId ? "Edit" : "Create"} Audience Segment</h1>
      <p className="text-sm text-gray-500 mb-6">Define criteria to automatically group matching customers.</p>
      <SegmentForm segmentId={segmentId} />
    </div>
  );
}