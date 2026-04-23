'use client';
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import { DocumentModal } from "./DocumentModal";
import { VendorDocument } from "@/utils/Types";
import { useState } from "react";

export function DocumentsSection({ documents }: { documents: VendorDocument[] }) {
    const [activeDoc, setActiveDoc] = useState<VendorDocument | null>(null);
    const [scrollIndex, setScrollIndex] = useState(0);
    const visibleCount = 9;

    if (!documents || documents.length === 0) {
        return (
            <div className="mt-6 border-2 border-dashed border-gray-200 rounded-xl px-8 py-8 flex flex-col items-center gap-2 text-gray-400">
                <FileText size={28} className="text-gray-300" />
                <p className="text-sm font-medium">No documents submitted</p>
            </div>
        );
    }

    const canScrollLeft = scrollIndex > 0;
    const canScrollRight = scrollIndex + visibleCount < documents.length;

    return (
        <>
            {/* Modal */}
            {activeDoc && (
                <DocumentModal doc={activeDoc} onClose={() => setActiveDoc(null)} />
            )}

            <div className="mt-6 border-2 border-gray-300 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <FileText size={18} className="text-gray-500" />
                        Submitted Documents
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 ml-1">
                            {documents.length}
                        </span>
                    </h2>

                    {/* Scroll Controls */}
                    {documents.length > visibleCount && (
                        <div className="flex gap-1">
                            <button
                                onClick={() => setScrollIndex((i) => Math.max(0, i - 1))}
                                disabled={!canScrollLeft}
                                className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => setScrollIndex((i) => Math.min(documents.length - visibleCount, i + 1))}
                                disabled={!canScrollRight}
                                className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 overflow-hidden">
                    {documents.slice(scrollIndex, scrollIndex + visibleCount).map((doc) => (
                        <DocumentCard key={doc.id} doc={doc} onClick={() => setActiveDoc(doc)} />
                    ))}
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
                    {["approved", "pending", "rejected"].map((status) => (
                        <span key={status} className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span className={`w-2 h-2 rounded-full ${status === "approved" ? "bg-emerald-400" : status === "pending" ? "bg-amber-400" : "bg-red-400"}`} />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    ))}
                    <span className="text-xs text-gray-400 ml-auto italic">Click any document to preview</span>
                </div>
            </div>
        </>
    );
}
