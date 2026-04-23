'use client';
import { formatStructure, isImageUrl, isPdfUrl } from "@/lib/utils";
import { VendorDocument } from "@/utils/Types";
import { FileText, ZoomIn } from "lucide-react";

export function DocumentCard({
    doc,
    onClick,
}: {
    doc: VendorDocument;
    onClick: () => void;
}) {
    const isImage = isImageUrl(doc.document_url);
    const isPdf = isPdfUrl(doc.document_url);

    const statusColors: Record<string, string> = {
        approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
        pending: "bg-amber-50 text-amber-600 border-amber-200",
        rejected: "bg-red-50 text-red-600 border-red-200",
    };

    const statusClass =
        statusColors[doc.document_status] ?? "bg-gray-50 text-gray-600 border-gray-200";

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md transition-all bg-white w-44 shrink-0"
        >
            {/* Thumbnail */}
            <div className="relative h-28 bg-gray-50 flex items-center justify-center overflow-hidden">
                {isImage ? (
                    <>
                        <img
                            src={doc.document_url}
                            alt={doc.document_type}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </>
                ) : isPdf ? (
                    <div className="flex flex-col items-center gap-1 text-red-400">
                        <FileText size={32} />
                        <span className="text-xs font-bold tracking-widest text-red-300">PDF</span>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <ZoomIn size={20} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                        <FileText size={32} />
                        <span className="text-xs">File</span>
                    </div>
                )}
            </div>

            {/* Meta */}
            <div className="px-3 py-2 flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-700 truncate capitalize">
                    {formatStructure(doc.document_type)}
                </p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit ${statusClass}`}>
                    {doc.document_status}
                </span>
            </div>
        </div>
    );
}
