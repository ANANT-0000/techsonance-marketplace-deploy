"use client";
import { VendorDocumentTypes } from "@/constants";
import { ComplianceField } from "@/utils/Types";
import { DynamicIcon } from "lucide-react/dynamic";
import { useState, Dispatch, SetStateAction } from "react";

type FileEntry = {
    file: File | null;
    type: string;
    index: number;
};

type DocUploadInputProps = {
    setFileMap: Dispatch<SetStateAction<FileEntry[]>>;
    fileMap: FileEntry[];
    typeList: ComplianceField[] | typeof VendorDocumentTypes;
    title: string;
};
export type { FileEntry };

function truncateWords(text: string, charLimit: number): string {
    if (text.length <= charLimit) return text;
    return text.slice(0, charLimit) + "...";
}

export const DocUploadInput = ({
    setFileMap,
    fileMap,
    typeList,
    title,
}: DocUploadInputProps) => {
    const [showField, setShowField] = useState(false);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldValue: string,
        index: number
    ) => {
        const file = e.target.files?.[0] ?? null;
        setFileMap((prevMap) => {
            const existingIndex = prevMap.findIndex((item) => item.index === index);
            if (existingIndex !== -1) {
                const updatedMap = [...prevMap];
                updatedMap[existingIndex] = { file, type: fieldValue, index };
                return updatedMap;
            }
            return [...prevMap, { file, type: fieldValue, index }];
        });
    };

    return (
        <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="w-full pb-3 border-b-2 border-b-black/10">
                <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-gray-700">{title}</p>
                </div>

                <div>
                    <button
                        type="button"
                        className="mb-2 items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-400 border border-transparent rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={() => setShowField(!showField)}
                    >
                        {showField ? "Hide" : "Show"} Fields
                    </button>
                </div>

                {fileMap.length === 0 && (
                    <div className="mb-2 flex flex-col items-center justify-center py-2 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                        <DynamicIcon
                            name="file-text"
                            className="w-4 h-4 mb-2 opacity-40"
                            fallback={() => <span />}
                        />
                        <p className="text-sm">No documents added yet</p>
                    </div>
                )}

                {/* Summary of already-uploaded files even when fields are hidden */}
                {fileMap.length > 0 && !showField && (
                    <div className="flex flex-col gap-1 mb-2">
                        {fileMap.map((entry) =>
                            entry.file ? (
                                <p key={entry.index} className="text-xs text-green-600">
                                    ✓ [{entry.type}] {truncateWords(entry.file.name, 40)}
                                </p>
                            ) : null
                        )}
                    </div>
                )}

                {showField && (
                    <div className="flex flex-col gap-3">
                        {typeList.map((field, index) => {
                            const entry = fileMap.find((item) => item.index === index);

                            return (
                                <div
                                    key={index}
                                    className="flex justify-between items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl py-2 px-1 group hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                                >
                                    {/* Index badge */}
                                    <span className="shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600">
                                        {index + 1}
                                    </span>

                                    {/* File input */}
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="file"
                                            className="block text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:shadow-sm file:border-gray-200 hover:file:bg-gray-50 cursor-pointer w-full"
                                            onChange={(e) => handleFileChange(e, field.value, index)}
                                            accept="image/jpeg, image/png, application/pdf"
                                        />
                                        {entry?.file && (
                                            <p className="text-xs text-green-600 mt-1 truncate">
                                                ✓ {truncateWords(entry.file.name, 40)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="border rounded-md flex-1 py-1 px-4 shadow-sm bg-white">
                                        <p>{field.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
