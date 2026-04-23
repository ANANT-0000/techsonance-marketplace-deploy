'use client';
import { formatDate, formatStructure, isImageUrl, isPdfUrl } from "@/lib/utils";
import { VendorDocument } from "@/utils/Types";
import { ExternalLink, FileText, ImageIcon } from "lucide-react";

export function DocumentModal({
    doc,
    onClose,
}: {
    doc: VendorDocument;
    onClose: () => void;
}) {
    const isImage = isImageUrl(doc.document_url);
    const isPdf = isPdfUrl(doc.document_url);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        {isImage
                            ? <ImageIcon size={18} className="text-blue-500" />
                            : <FileText size={18} className="text-red-500" />
                        }
                        <div>
                            <p className="font-semibold text-gray-800 capitalize">
                                {formatStructure(doc.document_type)}
                            </p>
                            <p className="text-xs text-gray-400">{formatDate(doc.created_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={doc.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            <ExternalLink size={13} /> Open Original
                        </a>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors text-lg font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="max-h-[75vh] overflow-auto bg-gray-100 flex items-center justify-center p-4">
                    {isImage && (
                        <img
                            src={doc.document_url}
                            alt={doc.document_type}
                            className="max-w-full max-h-[65vh] object-contain rounded-lg shadow"
                        />
                    )}
                    {isPdf && (
                        <iframe
                            src={doc.document_url}
                            title={doc.document_type}
                            className="w-full h-[65vh] rounded-lg border border-gray-200"
                        />
                    )}
                    {!isImage && !isPdf && (
                        <div className="flex flex-col items-center gap-3 py-12 text-gray-500">
                            <FileText size={40} className="text-gray-300" />
                            <p className="text-sm">Preview not available for this file type.</p>
                            <a
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-sm hover:underline"
                            >
                                Open file ↗
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}