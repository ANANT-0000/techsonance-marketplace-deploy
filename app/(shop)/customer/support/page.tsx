"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Headphones, 
  PackageSearch, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Upload,
  Link as LinkIcon,
  X,
  FileText,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import AxiosAPI from "@/lib/axios";
import { formatCurrency } from "@/lib/utils";

const FAQS = [
  { question: "How do I track my order?", answer: "You can track your order in the Dashboard under 'My Orders'." },
  { question: "What is your return policy?", answer: "Our standard policy allows free returns within 30 days of delivery for eligible items." },
  { question: "Can I change my shipping address after purchase?", answer: "Address changes can be requested via support within 1 hour of placing an order." }
];

export default function HelpCenterPage() {
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"faq" | "tickets" | "returns">("faq");
  
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Order Issues");
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");

  // Order linking state
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [linkedOrderItemId, setLinkedOrderItemId] = useState("");
  const [linkedOrderId, setLinkedOrderId] = useState("");

  // Returns state
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(true);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch tickets and orders
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchTickets();
      fetchRecentOrderItems();
      fetchReturns();
    } else {
      setLoadingTickets(false);
      setLoadingReturns(false);
    }
  }, [isAuthenticated, user?.id]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await AxiosAPI.get(`/v1/tickets/customer/${user?.id}`);
      if (res.data) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchRecentOrderItems = async () => {
    try {
      setLoadingOrders(true);
      const res = await AxiosAPI.get(`/v1/order-items/user/${user?.id}`);
      if (res.data?.data) {
        setOrderItems(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch recent order items", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchReturns = async () => {
    try {
      setLoadingReturns(true);
      const res = await AxiosAPI.get(`/v1/returns/user/${user?.id}`);
      if (res.data) {
        setReturnsList(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch return requests", err);
    } finally {
      setLoadingReturns(false);
    }
  };

  // Handle file select & upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setUploadingFile(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await AxiosAPI.post("/v1/cloudinary/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (res.data?.url) {
        setAttachmentUrl(res.data.url);
      } else {
        setErrorMsg("Failed to upload attachment. Please try again.");
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Attachment upload error", err);
      setErrorMsg("Failed to upload file to the server.");
      setSelectedFile(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAttachmentUrl("");
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    
    try {
      setSubmitLoading(true);
      setErrorMsg("");
      setSuccessMsg("");
      
      const payload: any = {
        subject,
        description: message,
        category,
      };

      if (linkedOrderId) {
        payload.orderId = linkedOrderId;
      }
      if (attachmentUrl) {
        payload.attachmentUrl = attachmentUrl;
      }

      const res = await AxiosAPI.post(`/v1/tickets/customer/${user?.id}`, payload);
      
      if (res.status === 201) {
        setSuccessMsg("Support ticket created successfully! We will get back to you soon.");
        setSubject("");
        setMessage("");
        setLinkedOrderItemId("");
        setLinkedOrderId("");
        setSelectedFile(null);
        setAttachmentUrl("");
        fetchTickets();
        setActiveTab("tickets");
      } else {
        setErrorMsg("Failed to submit ticket. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting ticket", err);
      setErrorMsg("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-750 border-blue-200";
      case "in_progress":
        return "bg-amber-100 text-amber-750 border-amber-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-750 border-emerald-200";
      case "closed":
        return "bg-gray-100 text-gray-705 border-gray-200";
      default:
        return "bg-gray-100 text-gray-705 border-gray-200";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Render return request timeline tracking progress
  const renderReturnTimeline = (returnReq: any) => {
    const status = returnReq.status.toLowerCase();
    const type = returnReq.type.toLowerCase(); // return, replacement, refund
    
    const steps = [
      { key: "pending", label: "Requested", desc: "Awaiting approval" },
      { key: "approved", label: "Approved", desc: "Return request accepted" },
      ...(type !== "refund" ? [
        { key: "in_transit", label: "In Transit", desc: "Item shipped back" },
        { key: "delivered", label: "Inspected", desc: "QC check complete" }
      ] : []),
      { key: "completed", label: "Completed", desc: type === "refund" ? "Refund processed" : "Process finished" }
    ];

    // Determine current index active
    let activeIndex = 0;
    if (status === "approved") activeIndex = 1;
    else if (status === "in_transit") activeIndex = 2;
    else if (status === "delivered" || status === "qc_passed" || status === "qc_failed") activeIndex = type === "refund" ? 1 : 3;
    else if (status === "completed") activeIndex = type === "refund" ? 2 : 4;
    else if (status === "rejected") activeIndex = 1; // Rejected shows red at step 2

    return (
      <div className="mt-6 border-t border-gray-100 pt-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Request Progress Tracker</h4>
        <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-2">
          {/* Connecting line */}
          <div className="absolute left-[15px] md:left-0 top-[20px] md:top-[15px] h-[calc(100%-40px)] md:h-0.5 w-0.5 md:w-full bg-gray-200 -z-10" />

          {steps.map((step, idx) => {
            const isCompleted = idx <= activeIndex && status !== "rejected";
            const isCurrent = idx === activeIndex && status !== "rejected";
            const isRejectedStep = idx === 1 && status === "rejected";
            const isQcFailedStep = idx === 3 && status === "qc_failed";

            let icon = <Clock className="w-4 h-4 text-gray-400" />;
            let circleColor = "bg-white border-gray-200 text-gray-400";
            
            if (isCompleted) {
              icon = <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />;
              circleColor = "bg-emerald-50 border-emerald-300 text-emerald-600";
            } else if (isCurrent) {
              icon = <RefreshCw className="w-4.5 h-4.5 text-blue-600 animate-spin" />;
              circleColor = "bg-blue-50 border-blue-300 text-blue-600";
            } else if (isRejectedStep) {
              icon = <X className="w-4.5 h-4.5 text-red-600" />;
              circleColor = "bg-red-50 border-red-350 text-red-650";
            } else if (isQcFailedStep && idx === 3) {
              icon = <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />;
              circleColor = "bg-amber-50 border-amber-350 text-amber-650";
            }

            return (
              <div key={step.key} className="flex md:flex-col items-start md:items-center gap-4 md:gap-2 md:text-center md:flex-1 relative">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${circleColor}`}>
                  {icon}
                </div>
                <div className="flex flex-col md:items-center">
                  <span className={`text-sm font-bold ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-450"}`}>
                    {isRejectedStep ? "Rejected" : isQcFailedStep ? "QC Failed" : step.label}
                  </span>
                  <span className="text-xs text-gray-500 font-medium mt-0.5">{step.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Notes */}
        {(returnReq.store_owner_note || returnReq.customer_note) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-150">
            {returnReq.customer_note && (
              <p className="text-xs text-gray-600">
                <strong className="text-gray-800">Your Note:</strong> {returnReq.customer_note}
              </p>
            )}
            {returnReq.store_owner_note && (
              <p className="text-xs text-gray-700">
                <strong className="text-gray-900">Store Reply:</strong> {returnReq.store_owner_note}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen  py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Help Center Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Support & Help Center</h1>
          <p className="text-sm font-medium text-gray-500">Submit inquiry tickets, track returns, and browse common answers.</p>
        </div>

        {/* Custom Tab Selector */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto gap-2">
          <button 
            onClick={() => setActiveTab("faq")}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition-all shrink-0 ${
              activeTab === "faq" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            FAQs & New Ticket
          </button>
          <button 
            onClick={() => { setActiveTab("tickets"); fetchTickets(); }}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition-all shrink-0 flex items-center gap-2 ${
              activeTab === "tickets" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            My Support Tickets 
            {tickets.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-600 rounded-full">
                {tickets.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab("returns"); fetchReturns(); }}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition-all shrink-0 flex items-center gap-2 ${
              activeTab === "returns" 
              ? "border-blue-650 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Track Returns & Replacements
            {returnsList.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-600 rounded-full">
                {returnsList.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab content 1: FAQ & Contact Form */}
        {activeTab === "faq" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: FAQs & Returns CTA */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              
              {/* Returns Entry Point Call-To-Action */}
              <div className="bg-blue-600 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md shadow-blue-600/10">
                <div className="text-white text-center sm:text-left">
                  <h3 className="text-lg font-extrabold mb-1">Need to return or replace an item?</h3>
                  <p className="text-blue-100 text-xs font-semibold">Initiate a return request for any delivered orders directly.</p>
                </div>
                <Link 
                  href="/customer/orders" 
                  className="w-full sm:w-auto bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
                >
                  <PackageSearch className="w-4.5 h-4.5" /> Start Return
                </Link>
              </div>

              {/* FAQs */}
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {FAQS.map((faq, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all shadow-sm">
                      <button 
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none"
                      >
                        <span className="font-bold text-gray-905 text-sm sm:text-base">{faq.question}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaqIndex === idx && (
                        <div className="px-5 pb-5 text-gray-500 text-sm border-t border-gray-50 pt-3 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Create Ticket Form */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Create Support Ticket</h2>
                <p className="text-xs text-gray-500 mb-6">Describe your issue and we'll reply as soon as possible.</p>

                {!isAuthenticated ? (
                  <div className="border border-dashed border-gray-250 rounded-xl p-6 text-center">
                    <p className="text-sm text-gray-500 mb-4">Please log in to submit support tickets.</p>
                    <Link 
                      href="/auth/customerLogin" 
                      className="w-full inline-block text-center bg-[#0f172a] text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-sm text-sm"
                    >
                      Login to Support
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-655 text-xs">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-755 text-xs">
                        <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                        <span>{successMsg}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Issue Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-700"
                      >
                        <option value="Order Issues">Order Issues</option>
                        <option value="Payment & Refunds">Payment & Refunds</option>
                        <option value="Account Settings">Account Settings</option>
                      </select>
                    </div>

                    {/* Order selector for order-related categories */}
                    {(category === "Order Issues" || category === "Payment & Refunds") && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Link Order Item (Optional)</label>
                        {loadingOrders ? (
                          <div className="flex items-center gap-2 px-3 py-2 border rounded-xl bg-gray-50">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            <span className="text-xs text-gray-400">Loading order history...</span>
                          </div>
                        ) : orderItems.length === 0 ? (
                          <div className="text-xs text-gray-400 p-3 border rounded-xl bg-gray-50">
                            No recent purchases found to link.
                          </div>
                        ) : (
                          <select
                            value={linkedOrderItemId}
                            onChange={(e) => {
                              const itemId = e.target.value;
                              setLinkedOrderItemId(itemId);
                              const selectedItem = orderItems.find(item => item.id === itemId);
                              setLinkedOrderId(selectedItem?.order?.id || "");
                            }}
                            className="w-full text-xs px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-700"
                          >
                            <option value="">-- Do Not Link --</option>
                            {orderItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.variant?.variant_name} - ₹{formatCurrency(Number(item.price))} ({formatDate(item.created_at)})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                      <input 
                        type="text" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of the issue"
                        className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                      <textarea 
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Detailed description..."
                        className="w-full text-sm p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400 font-medium resize-none"
                        required
                      />
                    </div>

                    {/* Screenshot / File Attachment */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attach Screenshot (Optional)</label>
                      <div className="mt-1 flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="ticket-file-input"
                          disabled={uploadingFile}
                        />
                        
                        {!attachmentUrl ? (
                          <label
                            htmlFor="ticket-file-input"
                            className={`cursor-pointer px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors flex items-center gap-2 ${
                              uploadingFile ? "opacity-50 pointer-events-none" : ""
                            }`}
                          >
                            <Upload size={14} />
                            {uploadingFile ? "Uploading..." : "Upload Screenshot"}
                          </label>
                        ) : (
                          <div className="flex items-center gap-2 bg-blue-50 border border-blue-150 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700">
                            <span className="truncate max-w-[150px]">{selectedFile?.name || "attachment.png"}</span>
                            <button 
                              type="button" 
                              onClick={handleRemoveFile}
                              className="text-blue-550 hover:text-blue-900 ml-1.5 focus:outline-none"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        {uploadingFile && <Loader2 className="w-4.5 h-4.5 text-blue-600 animate-spin" />}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submitLoading || uploadingFile}
                      className="w-full bg-[#0f172a] text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-sm disabled:bg-gray-450 flex items-center justify-center gap-2 text-sm mt-2"
                    >
                      {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Submit Ticket
                    </button>
                  </form>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Need faster help?</p>
                    <p className="text-xs font-medium text-gray-500">Live chat available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab content 2: Support Tickets list */}
        {activeTab === "tickets" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Support Tickets</h2>

            {!isAuthenticated ? (
              <div className="text-center py-12">
                <Headphones className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-800 font-bold mb-1">Sign in to view support tickets</p>
                <p className="text-xs text-gray-500 mb-6">Access tickets submitted to resolve account or purchase issues.</p>
                <Link 
                  href="/auth/customerLogin" 
                  className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-750 transition-colors shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            ) : loadingTickets ? (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                <Headphones className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-805 font-bold mb-1">No support tickets created yet</p>
                <p className="text-xs text-gray-500 mb-4">Have an issue? Create a support ticket in the FAQs & New Ticket tab.</p>
                <button 
                  onClick={() => setActiveTab("faq")}
                  className="bg-blue-50 text-blue-650 hover:bg-blue-100 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const isExpanded = expandedTicketId === ticket.id;
                  return (
                    <div 
                      key={ticket.id}
                      className="border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:border-gray-300"
                    >
                      {/* Ticket Row Bar */}
                      <div 
                        onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 gap-3 cursor-pointer hover:bg-gray-50/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-900 capitalize">{ticket.category || "General"}</span>
                            <span className="text-xs text-gray-400 font-medium">#{ticket.id.slice(0, 8)}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 line-clamp-1">{ticket.subject}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                          <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border shrink-0 ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className="text-xs text-gray-450 shrink-0 font-medium">{formatDate(ticket.created_at)}</span>
                        </div>
                      </div>

                      {/* Ticket Details Expanded */}
                      {isExpanded && (
                        <div className="bg-gray-50/50 border-t border-gray-150 p-5 space-y-4 text-sm">
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                          </div>

                          {/* Order / Attachment References */}
                          {(ticket.order_id || ticket.attachment_url) && (
                            <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
                              {ticket.order_id && (
                                <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-xl text-xs font-semibold text-gray-750">
                                  <LinkIcon size={14} className="text-gray-400" />
                                  <span>Linked Order ID: #{ticket.order_id.slice(0, 8)}</span>
                                  <Link 
                                    href={`/customer/orders/${ticket.order_id}`} 
                                    className="text-blue-600 hover:text-blue-750 font-bold ml-1.5 flex items-center gap-0.5"
                                  >
                                    View Order <ArrowRight size={12} />
                                  </Link>
                                </div>
                              )}
                              
                              {ticket.attachment_url && (
                                <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-xl text-xs font-semibold text-gray-750">
                                  <FileText size={14} className="text-gray-400" />
                                  <span>Attachment Preview:</span>
                                  <a 
                                    href={ticket.attachment_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-blue-600 hover:text-blue-750 font-bold ml-1"
                                  >
                                    Open Image
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Quick thumbnail of attachment */}
                          {ticket.attachment_url && (
                            <div className="mt-2 w-32 h-32 rounded-xl border border-gray-200 overflow-hidden bg-white p-1">
                              <img 
                                src={ticket.attachment_url} 
                                alt="Support attachment" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab content 3: Returns list tracker */}
        {activeTab === "returns" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Returns & Replacements Status Tracker</h2>

            {!isAuthenticated ? (
              <div className="text-center py-12">
                <PackageSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-808 font-bold mb-1">Sign in to track return requests</p>
                <p className="text-xs text-gray-500 mb-6">Access tracking and review timelines for your raised returns or replacements.</p>
                <Link 
                  href="/auth/customerLogin" 
                  className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-750 transition-colors shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            ) : loadingReturns ? (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading returns history...</p>
              </div>
            ) : returnsList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                <PackageSearch className="w-12 h-12 text-gray-450 mx-auto mb-4" />
                <p className="text-gray-805 font-bold mb-1">No return requests found</p>
                <p className="text-xs text-gray-500 mb-6">You can request returns or replacements directly from your Order History.</p>
                <Link 
                  href="/customer/orders" 
                  className="bg-blue-50 text-blue-650 hover:bg-blue-100 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Go to Orders
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {returnsList.map((returnReq) => {
                  const typeLabel = returnReq.type === "return" ? "Return Request" : returnReq.type === "replacement" ? "Replacement Request" : "Refund Request";
                  const variant = returnReq.orderItem?.variant;
                  const primaryImage = variant?.images?.[0]?.image_url;

                  return (
                    <div 
                      key={returnReq.id}
                      className="border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm transition-all hover:border-gray-300"
                    >
                      {/* Return Header summary */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-4 gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-blue-650 uppercase tracking-wide">
                              {typeLabel}
                            </span>
                            <span className="text-xs text-gray-450 font-medium">#{returnReq.id.slice(0, 8)}</span>
                          </div>
                          <p className="text-xs text-gray-500 font-semibold mt-0.5">Submitted on {formatDate(returnReq.created_at)}</p>
                        </div>
                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-md capitalize">
                          Reason: {returnReq.reason}
                        </span>
                      </div>

                      {/* Product details info if loaded */}
                      {variant && (
                        <div className="flex gap-4 items-center mb-6">
                          <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-150 p-1 overflow-hidden flex items-center justify-center shrink-0">
                            <img
                              src={primaryImage || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Product'}
                              alt={variant.variant_name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                              {variant.variant_name}
                            </h4>
                            <p className="font-extrabold text-gray-705 text-xs sm:text-sm mt-0.5">
                              ₹{formatCurrency(Number(variant.price))}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Progress Tracker timeline */}
                      {renderReturnTimeline(returnReq)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}