'use client';
import { Navbar } from "@/components/admin/Navbar";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import { UploadCloud, FileText, X } from "lucide-react";
import { fetchCreateTemplate, fetchTemplateById, fetchUpdateTemplate } from "@/utils/adminApiClients";
import { authToken } from "@/utils/authToken";

interface TemplateFormSchema {
    template_name: string;
    template_label: string;
    description: string;
}

const getTemplate = async (id: string, token: string) => {
    const template = await fetchTemplateById(id, token);
    return template.data;
}

export default function TemplateFormPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');  

    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<TemplateFormSchema>();
    const token = authToken();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Load Data if Edit Mode
    useEffect(() => {
        if (editId) {
            const loadTemplate = async () => {
                try {
                    const template = await getTemplate(editId, token!);
                    setValue("template_name", template.template_name);
                    setValue("template_label", template.template_label);
                    setValue("description", template.description);
                    setPreviewUrl(template.template_url);
                } catch (error) {
                    setGlobalError("Failed to load template.");
                }
            };
            loadTemplate();
        }
    }, [editId, token, setValue]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== "application/pdf") {
                setGlobalError("Only PDF files are allowed.");
                return;
            }
            setGlobalError(null);
            setPdfFile(file);
        }
    };

    const handleRemoveExisting = () => {
        if (previewUrl) {
            setPreviewUrl(null);
        }
    };

    const onSubmit = async (data: TemplateFormSchema) => {
        // Validate that there's either a new file, or we're editing and haven't deleted the old one
        if (!pdfFile && !editId) {
            setGlobalError("Please upload a PDF template.");
            return;
        }
        if (editId && !previewUrl && !pdfFile) {
            setGlobalError("Please upload a new PDF template to replace the removed one.");
            return;
        }

        const payload = {
            template_name: data.template_name,
            template_label: data.template_label,
            description: data.description,
        };

        const formData = new FormData();
        formData.append("templateData", JSON.stringify(payload));
        
        if (pdfFile) {
            formData.append("template_file", pdfFile);
        }
        let res;
        try {
            if (editId) {
                 res = await fetchUpdateTemplate(editId, formData, token!);
                console.log(res);
            } else {
                res = await fetchCreateTemplate(formData, token!);
                console.log(res);
            }
            // Example success redirect (uncomment and adjust according to your API response)
            if (res.status === 201 || res.status === 200) router.push('../templates');
            else setGlobalError(res.message);
        } catch (error) {
            setGlobalError("Failed to save template.");
        }
    };

    return (
        <>
            <Navbar title={editId ? "Update Template" : "Create Template"} />
            <main className="admin_vendorManagement px-1 py-4 w-full">
                <header className="flex justify-between items-center my-6">
                    <div>
                        <h1 className="font-bold text-2xl text-gray-800">
                            {editId ? "Update Document Template" : "Create Document Template"}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            These templates will be shown to vendors for selection.
                        </p>
                    </div>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
                    <section className="border border-gray-100 bg-white p-6 rounded-2xl w-full shadow-md shadow-gray-100/80">
                        
                        {globalError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                                {globalError}
                            </div>
                        )}

                        <div className="flex flex-col gap-5">
                            {/* Template ID & Label */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-sm font-semibold text-gray-600">
                                        Template ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., TPL-AGR-01"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        {...register("template_name", { required: "Template ID is required" })}
                                    />
                                    {errors.template_name && <p className="text-xs text-red-500">{errors.template_name.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-sm font-semibold text-gray-600">
                                        Template Label <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Vendor Non-Disclosure Agreement"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        {...register("template_label", { required: "Template Label is required" })}
                                    />
                                    {errors.template_label && <p className="text-xs text-red-500">{errors.template_label.message}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-sm font-semibold text-gray-600">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Briefly describe what this template is used for..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    {...register("description", { required: "Description is required" })}
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                            </div>

                            {/* Dynamic PDF Upload Area */}
                            <div className="flex flex-col gap-2 w-full mt-2">
                                <label className="text-sm font-semibold text-gray-600">
                                    Upload PDF Template <span className="text-red-500">*</span>
                                </label>
                                
                                {previewUrl ? (
                                    // State 1: Show existing uploaded file from backend
                                    <div className="relative mt-2">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 bg-gray-50 rounded-xl pr-10">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-lg text-red-500 border border-gray-100 shadow-sm">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-800">Current Template Document</span>
                                                    <button 
                                                        onClick={() => setShowPreview(true)} 
                                                        className="text-xs text-blue-500 hover:text-blue-700 underline mt-0.5 w-fit"
                                                    >
                                                        View Existing PDF
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Top Corner Remove Button */}
                                        <button 
                                            type="button" 
                                            onClick={handleRemoveExisting}
                                            className="absolute -top-2.5 -right-2.5 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors border border-red-200 shadow-sm"
                                            title="Remove document"
                                        >
                                            <X size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ) : !pdfFile ? (
                                    // State 2: Upload Area
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-center">
                                        <input 
                                            type="file" 
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <UploadCloud className="text-gray-400 mb-3" size={32} />
                                        <p className="text-sm font-semibold text-blue-600">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500 mt-1">PDF files only (Max 10MB)</p>
                                    </div>
                                ) : (
                                    // State 3: New local file selected
                                    <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg text-red-500">
                                                <FileText size={24} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-800">{pdfFile.name}</span>
                                                <span className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setPdfFile(null)}
                                            className="p-1.5 hover:bg-blue-100 rounded-lg text-gray-600 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="w-full flex justify-end items-center gap-4 mt-8 pt-4 border-t border-gray-100">
                            <Link
                                href="../templates"
                                className="py-2.5 px-6 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="py-2.5 px-6 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all shadow-sm"
                            >
                                {isSubmitting ? "Saving..." : editId ? "Update Template" : "Save Template"}
                            </button>
                        </div>
                    </section>
                </form>
            </main>
              {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <FileText className="text-red-500" size={20} />
                                <h2 className="text-lg font-bold text-gray-800">Document Preview</h2>
                            </div>
                            <button 
                                onClick={() => setShowPreview(false)} 
                                className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-500 hover:text-gray-800"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Body (Iframe) */}
                        <div className="flex-1 w-full bg-gray-100 relative">
                            {/* The '#toolbar=0' optionally hides the native PDF viewer toolbar depending on the browser */}
                            <iframe 
                                src={`${previewUrl}#toolbar=0`} 
                                className="w-full h-full border-none" 
                                title="PDF Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}