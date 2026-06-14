"use client";
import { Navbar } from "@/components/admin/Navbar";
import { Pagination } from "@/components/common/Pagination";
import { searchImgDark } from "@/constants/common";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/reduxHooks";
import { FileText, Plus, Edit, Trash2, X } from "lucide-react";
import { fetchTemplates, fetchDeleteTemplate } from "@/utils/adminApiClients";
import { authToken } from "@/utils/authToken";
import {
  ActionType,
  ConfirmationModal,
} from "@/components/common/ConfirmationModal";
import toast from "react-hot-toast";

export interface Template {
  id: string;
  template_label: string;
  template_name: string;
  template_url: string;
  description: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  vendor_id: string;
}

const fetchData = async (
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  token: string | null,
) => {
  try {
    setIsLoading(true);
    if (!token) {
      toast.error("No auth token found. Please log in.");
      return;
    }
    const res = await fetchTemplates(token);
    setTemplates(res.data || []);
  } catch (error) {
    toast.error("Error fetching templates");
  } finally {
    setIsLoading(false);
  }
};
export default function TemplatesPage() {
  const { theme } = useAppSelector((state) => state.adminTheme);
  const [count, setCount] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: "",
    message: "",
    actionType: "" as ActionType,
    confirmText: "",
    onConfirm: () => {},
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const pageSize = 10;
  const token = authToken();
  useEffect(() => {
    fetchData(setTemplates, setIsLoading, token);
  }, [search, count]);
  const totalPages = Math.ceil(templates && templates.length / pageSize);
  const handleDelete = async (id: string) => {
    token &&
      setConfirmModalConfig({
        title: "Delete Template?",
        message:
          "This action cannot be undone. Are you sure you want to delete this template?",
        actionType: "danger",
        confirmText: "Yes, Delete",
        onConfirm: async () => {
          setIsProcessing(true);
          await fetchDeleteTemplate(id, token);
          setTemplates((prev) => prev.filter((template) => template.id !== id));
          setIsProcessing(false);
          setIsConfirmModalOpen(false);
        },
      });
    setIsConfirmModalOpen(true);
  };
  return (
    <>
      <Navbar title="Templates" />
      <main className="w-full px-1 py-4">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-6 gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <FileText size={22} className="text-blue-500" />
            <div>
              <h1 className="text-theme-h4 font-bold text-gray-800">
                PDF Templates
              </h1>
              <p className="text-theme-caption text-gray-500 mt-1">
                Manage agreement and policy PDFs for vendors.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="templates/templateForm"
              className="flex items-center gap-2 font-semibold text-theme-body-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Create Template
            </Link>
          </div>
        </header>

        <div
          className={`relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4 ${theme === "light" ? "" : "invert"}`}
        >
          <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
            <img
              className="w-5 h-5 opacity-50 shrink-0"
              src={searchImgDark}
              alt="search icon"
            />
            <input
              type="text"
              className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
              placeholder="Search templates by ID or label"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </span>
        </div>

        <div
          className={`w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white ${theme === "light" ? "" : "invert"}`}
        >
          <table className="w-full table-auto min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Template ID
                </th>
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Label
                </th>
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Description
                </th>
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Document
                </th>
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {templates && templates.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-gray-400 text-theme-body-sm"
                  >
                    <FileText size={36} className="mx-auto mb-3 opacity-30" />
                    No templates found.
                  </td>
                </tr>
              ) : (
                templates &&
                templates.map((template) => (
                  <tr
                    key={template.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {template.template_name}
                    </td>
                    <td className="p-4 text-theme-body-sm text-gray-800">
                      {template.template_label}
                    </td>
                    <td
                      className="p-4 text-theme-body-sm text-gray-500 max-w-[250px] truncate"
                      title={template.description}
                    >
                      {template.description}
                    </td>
                    <td className="p-4 text-theme-body-sm text-blue-500 underline cursor-pointer">
                      <button
                        onClick={() => setPreviewUrl(template.template_url)}
                        className="text-blue-500 hover:text-blue-700 underline font-medium transition-colors"
                      >
                        View PDF
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`templates/templateForm?id=${template.id}`}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          onClick={() => {
                            handleDelete(template.id);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <span className="flex justify-end mt-4">
          <Pagination
            setCount={setCount}
            count={count}
            totalPages={totalPages}
            style="relative right-0 w-54"
          />
        </span>
      </main>
      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="text-red-500" size={20} />
                <h2 className="text-theme-h6 font-bold text-gray-800">
                  Document Preview
                </h2>
              </div>
              <button
                onClick={() => setPreviewUrl(null)}
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
      <ConfirmationModal
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        actionType={confirmModalConfig.actionType}
        confirmText={confirmModalConfig.confirmText}
        onConfirm={confirmModalConfig.onConfirm}
        onClose={() => setIsConfirmModalOpen(false)}
        isOpen={isConfirmModalOpen}
        isLoading={isProcessing}
      />
    </>
  );
}
