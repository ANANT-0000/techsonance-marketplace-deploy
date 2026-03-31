"use client";
import { DynamicIcon } from "lucide-react/dynamic";
import { useState, useCallback, useImperativeHandle, forwardRef } from "react";


type FileEntry = {
    file: File | null;
    type: string;
};

export type DocUploadInputRef = {
    getPairs: () => { file: File | null; type: string }[];
};

type Props = {
    appendDoc: (val: { document: undefined; document_type: undefined }) => void;
    documentFields: { id: string }[];
    removeDocument: (index: number) => void;
    typeList: { value: string; label: string }[];
    title: string;
};
function truncateWords(text: string, wordLimit: number): string {
    const words = text.split('',);

    if (words.length <= wordLimit) {
        return text;
    }
    return words.slice(0, wordLimit).join('') + '...';
}
export const DocUploadInput = (
    ({ setFileMap, fileMap, typeList, title }) => {
        const [showField, setShowField] = useState(false);
        // Expose getPairs() to parent via ref
        const handleFileChange = (
            e: React.ChangeEvent<HTMLInputElement>,
            fieldId: string,
            index: number
        ) => {
            const file = e.target.files?.[0] ?? null;
            setFileMap((prevMap) => {
                // 1. Check if an entry with this index already exists
                const existingIndex = prevMap.findIndex((item) => item.index === index);
                if (existingIndex !== -1) {
                    // 2. If it exists, create a copy and replace the item at that position
                    const updatedMap = [...prevMap];
                    updatedMap[existingIndex] = { file, type: fieldId ?? "", index };
                    return updatedMap;
                } else {
                    // 3. If it doesn't exist, append the new file object
                    return [...prevMap, { file, type: fieldId ?? "", index }];
                }
            });


        };
        console.log("   fileMap in change handler", fileMap);
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
                            <DynamicIcon name="file-text" className="w-4 h-4 mb-2 opacity-40" />
                            <p className="text-sm">No documents added yet</p>
                        </div>
                    )}
                    {showField && (
                        <div className="flex flex-col gap-3">
                            {typeList.map((field, index) => {
                                const entry = fileMap[field.value];
                                // const isPaired = !!entry?.file && !!entry?.type;

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
                                                className="block text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:shadow-sm  file:border-gray-200 hover:file:bg-gray-50 cursor-pointer w-full"
                                                onChange={(e) => handleFileChange(e, field.value, index)}
                                                accept="image/jpeg, image/png, application/pdf"
                                            />
                                            {/* Preserved filename — survives re-renders */}
                                            {entry?.file && (
                                                <p className="text-xs text-green-600 mt-1 truncate text-clip">
                                                    ✓ {truncateWords(entry.file.name, 10)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="border rounded-md flex-1  py-1 px-4 shadow-sm bg-white ">

                                            <p>{field.label}</p>
                                        </div>
                                        {/* Type select — controlled by fileMap */}
                                        {/* <select
                                        value={entry?.type ?? ""}
                                        onChange={(e) => handleTypeChange(e, field.id)}
                                        className="shrink-0 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                                    >
                                        <option value="" disabled>
                                            Select type
                                        </option>
                                        {typeList.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select> */}

                                        {/* Paired badge */}
                                        {/* {
                                        isPaired && (
                                            <span className="shrink-0 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg whitespace-nowrap">
                                                ✓
                                            </span>
                                        )
                                    } */}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div >
        );
    }
);

DocUploadInput.displayName = "DocUploadInput";