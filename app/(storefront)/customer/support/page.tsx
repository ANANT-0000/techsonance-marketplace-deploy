"use client";

import { useState, useEffect, useMemo, useReducer } from "react";
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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import AxiosAPI from "@/lib/axios";
import { formatCurrency } from "@/lib/utils";
import { SUPPORT_PAGE_TEXT } from "@/constants/customerText";
import { motion } from "framer-motion";
import { ReturnStatus } from "@/utils/Types";
import { CUSTOMER_LOGIN_PATH } from "@/constants";

export enum FormActionType {
  SET = "SET",
  RESET_FORM = "RESET_FORM",
  RESET_ATTACHMENT = "RESET_ATTACHMENT",
}

export enum DataActionType {
  SET = "SET",
}

export enum UIActionType {
  SET = "SET",
  RESET_FAQ_VOTES = "RESET_FAQ_VOTES",
}

export enum TicketThreadActionType {
  SET_COMMENTS = "SET_COMMENTS",
  SET_LOADING = "SET_LOADING",
  SET_COMMENT_TEXT = "SET_COMMENT_TEXT",
  SET_SUBMITTING_COMMENT = "SET_SUBMITTING_COMMENT",
  SET_RATING = "SET_RATING",
  SET_NPS_SCORE = "SET_NPS_SCORE",
  SET_FEEDBACK_COMMENT = "SET_FEEDBACK_COMMENT",
  SET_SUBMITTING_RATING = "SET_SUBMITTING_RATING",
  SET_RATING_SUBMITTED = "SET_RATING_SUBMITTED",
}

interface TicketThreadState {
  comments: any[];
  loading: boolean;
  commentText: string;
  submittingComment: boolean;
  rating: number;
  npsScore: number | null;
  feedbackComment: string;
  submittingRating: boolean;
  ratingSubmitted: boolean;
}

type TicketThreadAction =
  | { type: TicketThreadActionType.SET_COMMENTS; payload: any[] }
  | { type: TicketThreadActionType.SET_LOADING; payload: boolean }
  | { type: TicketThreadActionType.SET_COMMENT_TEXT; payload: string }
  | { type: TicketThreadActionType.SET_SUBMITTING_COMMENT; payload: boolean }
  | { type: TicketThreadActionType.SET_RATING; payload: number }
  | { type: TicketThreadActionType.SET_NPS_SCORE; payload: number | null }
  | { type: TicketThreadActionType.SET_FEEDBACK_COMMENT; payload: string }
  | { type: TicketThreadActionType.SET_SUBMITTING_RATING; payload: boolean }
  | { type: TicketThreadActionType.SET_RATING_SUBMITTED; payload: boolean };

const ticketThreadReducer = (
  state: TicketThreadState,
  action: TicketThreadAction,
): TicketThreadState => {
  switch (action.type) {
    case TicketThreadActionType.SET_COMMENTS:
      return { ...state, comments: action.payload };
    case TicketThreadActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case TicketThreadActionType.SET_COMMENT_TEXT:
      return { ...state, commentText: action.payload };
    case TicketThreadActionType.SET_SUBMITTING_COMMENT:
      return { ...state, submittingComment: action.payload };
    case TicketThreadActionType.SET_RATING:
      return { ...state, rating: action.payload };
    case TicketThreadActionType.SET_NPS_SCORE:
      return { ...state, npsScore: action.payload };
    case TicketThreadActionType.SET_FEEDBACK_COMMENT:
      return { ...state, feedbackComment: action.payload };
    case TicketThreadActionType.SET_SUBMITTING_RATING:
      return { ...state, submittingRating: action.payload };
    case TicketThreadActionType.SET_RATING_SUBMITTED:
      return { ...state, ratingSubmitted: action.payload };
    default:
      return state;
  }
};

interface TicketThreadProps {
  ticketId: string;
  userId: string;
  ticketStatus: string;
}

function TicketThread({ ticketId, userId, ticketStatus }: TicketThreadProps) {
  const [state, dispatch] = useReducer(ticketThreadReducer, {
    comments: [],
    loading: true,
    commentText: "",
    submittingComment: false,
    rating: 0,
    npsScore: null,
    feedbackComment: "",
    submittingRating: false,
    ratingSubmitted: false,
  });

  useEffect(() => {
    fetchComments();
    checkExistingRating();
  }, [ticketId]);

  const fetchComments = async () => {
    try {
      dispatch({ type: TicketThreadActionType.SET_LOADING, payload: true });
      const res = await AxiosAPI.get(`/v1/tickets/${ticketId}/comments`);
      if (res.data) {
        dispatch({
          type: TicketThreadActionType.SET_COMMENTS,
          payload: res.data,
        });
      }
    } catch (err) {
      void 0;
    } finally {
      dispatch({ type: TicketThreadActionType.SET_LOADING, payload: false });
    }
  };

  const checkExistingRating = () => {
    try {
      const rated = localStorage.getItem(`tn_rated_ticket_${ticketId}`);
      if (rated) {
        dispatch({
          type: TicketThreadActionType.SET_RATING_SUBMITTED,
          payload: true,
        });
      }
    } catch {}
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.commentText.trim()) return;

    try {
      dispatch({
        type: TicketThreadActionType.SET_SUBMITTING_COMMENT,
        payload: true,
      });
      const res = await AxiosAPI.post(`/v1/tickets/${ticketId}/comments`, {
        userId,
        commentText: state.commentText.trim(),
        isInternal: false,
      });
      if (res.data) {
        dispatch({
          type: TicketThreadActionType.SET_COMMENT_TEXT,
          payload: "",
        });
        toast.success("Comment sent");
        fetchComments();
      }
    } catch (err) {
      void 0;
      toast.error("Failed to send comment");
    } finally {
      dispatch({
        type: TicketThreadActionType.SET_SUBMITTING_COMMENT,
        payload: false,
      });
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.rating === 0) {
      toast.error("Please select a satisfaction rating");
      return;
    }

    try {
      dispatch({
        type: TicketThreadActionType.SET_SUBMITTING_RATING,
        payload: true,
      });
      const res = await AxiosAPI.post(`/v1/tickets/${ticketId}/rating`, {
        userId,
        satisfactionRating: state.rating,
        resolved: true,
        resolutionComment: state.feedbackComment,
        npsScore: state.npsScore !== null ? state.npsScore : undefined,
      });
      if (res.data) {
        dispatch({
          type: TicketThreadActionType.SET_RATING_SUBMITTED,
          payload: true,
        });
        try {
          localStorage.setItem(`tn_rated_ticket_${ticketId}`, "true");
        } catch {}
        toast.success("Thank you for your feedback!");
      }
    } catch (err) {
      void 0;
      toast.error("Failed to submit feedback");
    } finally {
      dispatch({
        type: TicketThreadActionType.SET_SUBMITTING_RATING,
        payload: false,
      });
    }
  };

  const isResolvedOrClosed =
    ticketStatus.toLowerCase() === "resolved" ||
    ticketStatus.toLowerCase() === "closed";

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-6">
      {/* Comments/Replies list */}
      <div>
        <h4 className="text-theme-caption font-bold text-muted-foreground uppercase tracking-wider mb-3">
          {SUPPORT_PAGE_TEXT.TICKET_THREAD_CONVERSATION_TITLE}
        </h4>

        {state.loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : state.comments.length === 0 ? (
          <p className="text-theme-caption text-muted-foreground italic py-2">
            {SUPPORT_PAGE_TEXT.TICKET_THREAD_NO_COMMENTS}
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {state.comments.map((comment) => {
              const isSupport =
                comment.user_role === "admin" || comment.user_role === "vendor";
              return (
                <div
                  key={comment.id}
                  className={`flex flex-col max-w-[85%] rounded-2xl px-4 py-2.5 text-theme-caption ${
                    isSupport
                      ? "bg-secondary text-foreground self-start border border-border mr-auto"
                      : "bg-muted text-foreground self-end ml-auto"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-bold">
                      {isSupport
                        ? SUPPORT_PAGE_TEXT.TICKET_THREAD_AGENT
                        : SUPPORT_PAGE_TEXT.TICKET_THREAD_YOU}
                    </span>
                    <span className="text-theme-tiny text-muted-foreground font-medium">
                      {new Date(comment.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {comment.comment_text}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New comment input form */}
      {!isResolvedOrClosed && (
        <form onSubmit={handlePostComment} className="flex gap-2">
          <textarea
            rows={1}
            value={state.commentText}
            onChange={(e) =>
              dispatch({
                type: TicketThreadActionType.SET_COMMENT_TEXT,
                payload: e.target.value,
              })
            }
            placeholder={SUPPORT_PAGE_TEXT.TICKET_THREAD_COMMENT_PLACEHOLDER}
            className="flex-1 text-theme-caption px-4 py-2.5 bg-background border border-border rounded-xl focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all font-medium text-foreground"
          />

          <button
            type="submit"
            disabled={state.submittingComment || !state.commentText.trim()}
            className="bg-foreground hover:bg-foreground/90 text-background font-bold text-theme-caption px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center shrink-0 disabled:bg-muted disabled:text-muted-foreground cursor-pointer"
          >
            {state.submittingComment ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              SUPPORT_PAGE_TEXT.TICKET_THREAD_COMMENT_SEND
            )}
          </button>
        </form>
      )}

      {/* Satisfaction / NPS Rating Section */}
      {isResolvedOrClosed && (
        <div className="pt-4 border-t border-border">
          {state.ratingSubmitted ? (
            <div className="bg-success/10 border border-success/20 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success shrink-0" />
              <div>
                <p className="text-theme-caption font-bold text-success">
                  {SUPPORT_PAGE_TEXT.TICKET_THREAD_FEEDBACK_SUCCESS_TITLE}
                </p>
                <p className="text-theme-xxs text-success/90">
                  {SUPPORT_PAGE_TEXT.TICKET_THREAD_FEEDBACK_SUCCESS_DESC}
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitRating}
              className="bg-card border border-border p-4 sm:p-5 rounded-2xl space-y-4"
            >
              <div>
                <h4 className="text-theme-caption font-bold text-foreground mb-1">
                  {SUPPORT_PAGE_TEXT.TICKET_THREAD_FEEDBACK_TITLE}
                </h4>
                <p className="text-theme-xxs text-muted-foreground">
                  {SUPPORT_PAGE_TEXT.TICKET_THREAD_FEEDBACK_DESC}
                </p>
              </div>

              {/* Star Rating 1-5 */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: TicketThreadActionType.SET_RATING,
                        payload: star,
                      })
                    }
                    className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                  >
                    <svg
                      className={`w-6 h-6 ${star <= state.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.355 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 8.72c-.768-.56-.374-1.81.588-1.81h4.908a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
              </div>

              {/* NPS Score 0-10 */}
              <div>
                <label className="block text-theme-tiny font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {SUPPORT_PAGE_TEXT.TICKET_THREAD_NPS_TITLE}
                </label>
                <div className="flex flex-wrap gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: TicketThreadActionType.SET_NPS_SCORE,
                          payload: num,
                        })
                      }
                      className={`w-7 h-7 rounded-lg text-theme-caption font-bold transition-all border cursor-pointer ${
                        state.npsScore === num
                          ? "bg-foreground text-background border-border shadow-sm"
                          : "bg-background text-foreground border-border hover:bg-secondary"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-medium px-1 mt-1">
                  <span>{SUPPORT_PAGE_TEXT.TICKET_THREAD_NPS_LOW}</span>
                  <span>{SUPPORT_PAGE_TEXT.TICKET_THREAD_NPS_HIGH}</span>
                </div>
              </div>

              {/* Text Comments */}
              <div>
                <label className="block text-theme-tiny font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {SUPPORT_PAGE_TEXT.TICKET_THREAD_FEEDBACK_COMMENT_LABEL}
                </label>
                <textarea
                  rows={2}
                  value={state.feedbackComment}
                  onChange={(e) =>
                    dispatch({
                      type: TicketThreadActionType.SET_FEEDBACK_COMMENT,
                      payload: e.target.value,
                    })
                  }
                  placeholder={
                    SUPPORT_PAGE_TEXT.TICKET_THREAD_FEEDBACK_COMMENT_PLACEHOLDER
                  }
                  className="w-full text-theme-caption px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all text-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={state.submittingRating || state.rating === 0}
                className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold text-theme-caption py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:bg-muted disabled:text-muted-foreground cursor-pointer"
              >
                {state.submittingRating && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {SUPPORT_PAGE_TEXT.TICKET_THREAD_FEEDBACK_SUBMIT}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
// Consolidated form & attachment state via reducer
type FormState = {
  submitLoading: boolean;
  subject: string;
  message: string;
  category: string;
  selectedFile: File | null;
  uploadingFile: boolean;
  attachmentUrl: string;
  linkedOrderItemId: string;
  linkedOrderId: string;
  errorMsg: string;
  successMsg: string;
};

type FormSetActionPayload = {
  [K in keyof FormState]: { key: K; value: FormState[K] };
}[keyof FormState];

type FormAction =
  | ({ type: FormActionType.SET } & FormSetActionPayload)
  | { type: FormActionType.RESET_FORM }
  | { type: FormActionType.RESET_ATTACHMENT };

const initialFormState: FormState = {
  submitLoading: false,
  subject: "",
  message: "",
  category: "Order Issues",
  selectedFile: null,
  uploadingFile: false,
  attachmentUrl: "",
  linkedOrderItemId: "",
  linkedOrderId: "",
  errorMsg: "",
  successMsg: "",
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case FormActionType.SET:
      return { ...state, [action.key]: action.value };
    case FormActionType.RESET_ATTACHMENT:
      return {
        ...state,
        selectedFile: null,
        attachmentUrl: "",
        uploadingFile: false,
      };
    case FormActionType.RESET_FORM:
      return { ...initialFormState };
    default:
      return state;
  }
}
const renderReturnTimeline = (returnReq: any) => {
  const status = returnReq.status.toLowerCase();
  const type = returnReq.type.toLowerCase(); // return, replacement, refund

  const steps = [
    {
      key: "pending",
      label: SUPPORT_PAGE_TEXT.TIMELINE_REQUESTED,
      desc: SUPPORT_PAGE_TEXT.TIMELINE_REQUESTED_DESC,
    },
    {
      key: "approved",
      label: SUPPORT_PAGE_TEXT.TIMELINE_APPROVED,
      desc: SUPPORT_PAGE_TEXT.TIMELINE_APPROVED_DESC,
    },
    ...(type !== "refund"
      ? [
          {
            key: "in_transit",
            label: SUPPORT_PAGE_TEXT.TIMELINE_IN_TRANSIT,
            desc: SUPPORT_PAGE_TEXT.TIMELINE_IN_TRANSIT_DESC,
          },
          {
            key: "delivered",
            label: SUPPORT_PAGE_TEXT.TIMELINE_INSPECTED,
            desc: SUPPORT_PAGE_TEXT.TIMELINE_INSPECTED_DESC,
          },
        ]
      : []),
    {
      key: "completed",
      label: SUPPORT_PAGE_TEXT.TIMELINE_COMPLETED,
      desc:
        type === "refund"
          ? SUPPORT_PAGE_TEXT.TIMELINE_COMPLETED_DESC_REFUND
          : SUPPORT_PAGE_TEXT.TIMELINE_COMPLETED_DESC_DEFAULT,
    },
  ];

  // Determine current index active
  let activeIndex = 0;
  if (status === ReturnStatus.APPROVED) activeIndex = 1;
  else if (status === ReturnStatus.SHIPPED || status === "in_transit")
    activeIndex = 2;
  else if (
    status === ReturnStatus.DELIVERED ||
    status === "qc_passed" ||
    status === ReturnStatus.QC_FAILED
  )
    activeIndex = type === "refund" ? 1 : 3;
  else if (status === "completed") activeIndex = type === "refund" ? 2 : 4;
  else if (status === ReturnStatus.REJECTED) activeIndex = 1; // Rejected shows red at step 2

  return (
    <div className="mt-6 border-t border-border pt-6">
      <h4 className="text-theme-caption font-bold text-muted-foreground uppercase tracking-wider mb-4">
        {SUPPORT_PAGE_TEXT.RETURNS_TRACKING_SECTION_TITLE}
      </h4>
      <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-2">
        {/* Connecting line */}
        <div className="absolute left-[15px] md:left-0 top-[20px] md:top-[15px] h-[calc(100%-40px)] md:h-0.5 w-0.5 md:w-full bg-border -z-10" />

        {steps.map((step, idx) => {
          const isCompleted =
            idx <= activeIndex && status !== ReturnStatus.REJECTED;
          const isCurrent =
            idx === activeIndex && status !== ReturnStatus.REJECTED;
          const isRejectedStep = idx === 1 && status === ReturnStatus.REJECTED;
          const isQcFailedStep = idx === 3 && status === ReturnStatus.QC_FAILED;

          let icon = <Clock className="w-4 h-4 text-muted-foreground" />;
          let circleColor = "bg-card border-border text-muted-foreground";

          if (isCompleted) {
            icon = <CheckCircle2 className="w-4.5 h-4.5 text-success" />;
            circleColor = "bg-success/10 border-success/20 text-success";
          } else if (isCurrent) {
            icon = (
              <RefreshCw className="w-4.5 h-4.5 text-primary animate-spin" />
            );

            circleColor = "bg-primary/10 border-primary/20 text-primary";
          } else if (isRejectedStep) {
            icon = <X className="w-4.5 h-4.5 text-destructive" />;
            circleColor =
              "bg-destructive/10 border-destructive/20 text-destructive";
          } else if (isQcFailedStep && idx === 3) {
            icon = <AlertTriangle className="w-4.5 h-4.5 text-warning" />;
            circleColor = "bg-warning/10 border-warning/20 text-warning";
          }

          return (
            <div
              key={step.key}
              className="flex md:flex-col items-start md:items-center gap-4 md:gap-2 md:text-center md:flex-1 relative"
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${circleColor}`}
              >
                {icon}
              </div>
              <div className="flex flex-col md:items-center">
                <span
                  className={`text-theme-body-sm font-bold ${isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {isRejectedStep
                    ? SUPPORT_PAGE_TEXT.TIMELINE_REJECTED
                    : isQcFailedStep
                      ? SUPPORT_PAGE_TEXT.TIMELINE_QC_FAILED
                      : step.label}
                </span>
                <span className="text-theme-caption text-muted-foreground font-medium mt-0.5">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Support Notes */}
      {(returnReq.store_owner_note || returnReq.customer_note) && (
        <div className="mt-6 p-4 bg-muted/50 rounded-xl space-y-2 border border-border">
          {returnReq.customer_note && (
            <p className="text-theme-caption text-muted-foreground">
              <strong className="text-foreground">
                {SUPPORT_PAGE_TEXT.RETURNS_CUSTOMER_NOTE}
              </strong>{" "}
              {returnReq.customer_note}
            </p>
          )}
          {returnReq.store_owner_note && (
            <p className="text-theme-caption text-muted-foreground">
              <strong className="text-foreground">
                {SUPPORT_PAGE_TEXT.RETURNS_STORE_REPLY}
              </strong>{" "}
              {returnReq.store_owner_note}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
// Data state (tickets, orders, returns)
type DataState = {
  tickets: any[];
  loadingTickets: boolean;
  orderItems: any[];
  loadingOrders: boolean;
  returnsList: any[];
  loadingReturns: boolean;
  helpArticles: any[];
  loadingHelpArticles: boolean;
};

type DataAction = {
  type: DataActionType.SET;
  key: keyof DataState;
  value: any;
};

const initialDataState: DataState = {
  tickets: [],
  loadingTickets: true,
  orderItems: [],
  loadingOrders: false,
  returnsList: [],
  loadingReturns: true,
  helpArticles: [],
  loadingHelpArticles: true,
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case DataActionType.SET:
      return { ...state, [action.key]: action.value };
    default:
      return state;
  }
}
export default function HelpCenterPage() {
  const { user, isAuthenticated } = useAppSelector(
    (state: RootState) => state.auth,
  );

  // UI state (tabs, FAQ, search, votes, expanded ticket)
  type UIState = {
    activeTab: "faq" | "tickets" | "returns";
    openFaqIndex: number | null;
    searchQuery: string;
    faqVotes: Record<string, "up" | "down" | null>;
    expandedTicketId: string | null;
  };

  type UISetActionPayload = {
    [K in keyof UIState]: { key: K; value: UIState[K] };
  }[keyof UIState];

  type UIAction =
    | ({ type: UIActionType.SET } & UISetActionPayload)
    | { type: UIActionType.RESET_FAQ_VOTES };

  const initialUIState: UIState = {
    activeTab: "faq",
    openFaqIndex: null,
    searchQuery: "",
    faqVotes: {},
    expandedTicketId: null,
  };

  function uiReducer(state: UIState, action: UIAction): UIState {
    switch (action.type) {
      case UIActionType.SET:
        return { ...state, [action.key]: action.value };
      case UIActionType.RESET_FAQ_VOTES:
        try {
          localStorage.removeItem("tn_faq_votes");
        } catch {}
        return { ...state, faqVotes: {} };
      default:
        return state;
    }
  }

  const [dataState, dataDispatch] = useReducer(dataReducer, initialDataState);

  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  const [uiState, uiDispatch] = useReducer(uiReducer, initialUIState);

  const FAQS_FILTERED = useMemo(() => {
    const q = uiState.searchQuery.trim().toLowerCase();
    const articles = dataState.helpArticles || [];
    if (!q) return articles;
    return articles.filter((art) =>
      (art.title + " " + art.content + " " + (art.category || ""))
        .toLowerCase()
        .includes(q),
    );
  }, [uiState.searchQuery, dataState.helpArticles]);

  useEffect(() => {
    fetchHelpArticles();
    try {
      const raw = localStorage.getItem("tn_faq_votes");
      if (raw) {
        uiDispatch({
          type: UIActionType.SET,
          key: "faqVotes",
          value: JSON.parse(raw),
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchTickets();
      fetchRecentOrderItems();
      fetchReturns();
    } else {
      dataDispatch({
        type: DataActionType.SET,
        key: "loadingTickets",
        value: false,
      });
      dataDispatch({
        type: DataActionType.SET,
        key: "loadingReturns",
        value: false,
      });
    }
  }, [isAuthenticated, user?.id]);

  const fetchHelpArticles = async () => {
    try {
      dataDispatch({
        type: DataActionType.SET,
        key: "loadingHelpArticles",
        value: true,
      });
      const res = await AxiosAPI.get("/v1/help-articles");
      if (res.data) {
        dataDispatch({
          type: DataActionType.SET,
          key: "helpArticles",
          value: res.data.data,
        });
      }
    } catch (err) {
    } finally {
      dataDispatch({
        type: DataActionType.SET,
        key: "loadingHelpArticles",
        value: false,
      });
    }
  };

  const fetchTickets = async () => {
    try {
      dataDispatch({
        type: DataActionType.SET,
        key: "loadingTickets",
        value: true,
      });
      const res = await AxiosAPI.get(`/v1/tickets/customer/${user?.id}`);
      if (res.data) {
        dataDispatch({
          type: DataActionType.SET,
          key: "tickets",
          value: res.data,
        });
      }
    } catch (err) {
    } finally {
      dataDispatch({
        type: DataActionType.SET,
        key: "loadingTickets",
        value: false,
      });
    }
  };

  const fetchRecentOrderItems = async () => {
    try {
      dataDispatch({
        type: DataActionType.SET,
        key: "loadingOrders",
        value: true,
      });
      const res = await AxiosAPI.get(`/v1/order-items/user/${user?.id}`);
      if (res.data?.data) {
        dataDispatch({
          type: DataActionType.SET,
          key: "orderItems",
          value: res.data.data,
        });
      }
    } catch (err) {
      void 0;
    } finally {
      dataDispatch({
        type: DataActionType.SET,
        key: "loadingOrders",
        value: false,
      });
    }
  };

  const fetchReturns = async () => {
    try {
      dataDispatch({
        type: DataActionType.SET,
        key: "loadingReturns",
        value: true,
      });
      const res = await AxiosAPI.get(`/v1/returns/user/${user?.id}`);
      if (res.data) {
        dataDispatch({
          type: DataActionType.SET,
          key: "returnsList",
          value: res.data,
        });
      }
    } catch (err) {
      void 0;
    } finally {
      dataDispatch({
        type: DataActionType.SET,
        key: "loadingReturns",
        value: false,
      });
    }
  };

  // Handle file select & upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch({ type: FormActionType.SET, key: "selectedFile", value: file });
    dispatch({ type: FormActionType.SET, key: "uploadingFile", value: true });
    dispatch({ type: FormActionType.SET, key: "errorMsg", value: "" });
    dispatch({ type: FormActionType.SET, key: "successMsg", value: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await AxiosAPI.post("/v1/cloudinary/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.url) {
        dispatch({
          type: FormActionType.SET,
          key: "attachmentUrl",
          value: res.data.url,
        });
      } else {
        dispatch({
          type: FormActionType.SET,
          key: "errorMsg",
          value: "Failed to upload attachment. Please try again.",
        });
        dispatch({
          type: FormActionType.SET,
          key: "selectedFile",
          value: null,
        });
      }
    } catch (err) {
      void 0;
      dispatch({
        type: FormActionType.SET,
        key: "errorMsg",
        value: "Failed to upload file to the server.",
      });
      dispatch({ type: FormActionType.SET, key: "selectedFile", value: null });
    } finally {
      dispatch({
        type: FormActionType.SET,
        key: "uploadingFile",
        value: false,
      });
    }
  };

  const handleRemoveFile = () => {
    dispatch({ type: FormActionType.RESET_ATTACHMENT });
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.subject.trim() || !formState.message.trim()) {
      dispatch({
        type: FormActionType.SET,
        key: "errorMsg",
        value: "Please fill in all fields.",
      });
      return;
    }

    try {
      dispatch({ type: FormActionType.SET, key: "submitLoading", value: true });
      dispatch({ type: FormActionType.SET, key: "errorMsg", value: "" });
      dispatch({ type: FormActionType.SET, key: "successMsg", value: "" });

      const payload: any = {
        subject: formState.subject,
        description: formState.message,
        category: formState.category,
      };

      if (formState.linkedOrderId) {
        payload.orderId = formState.linkedOrderId;
      }
      if (formState.attachmentUrl) {
        payload.attachmentUrl = formState.attachmentUrl;
      }

      const res = await AxiosAPI.post(
        `/v1/tickets/customer/${user?.id}`,
        payload,
      );

      if (res.status === 201) {
        dispatch({
          type: FormActionType.SET,
          key: "successMsg",
          value:
            "Support ticket created successfully! We will get back to you soon.",
        });
        dispatch({ type: FormActionType.RESET_FORM });
        fetchTickets();
        uiDispatch({
          type: UIActionType.SET,
          key: "activeTab",
          value: "tickets",
        });
      } else {
        dispatch({
          type: FormActionType.SET,
          key: "errorMsg",
          value: "Failed to submit ticket. Please try again.",
        });
      }
    } catch (err) {
      void 0;
      dispatch({
        type: FormActionType.SET,
        key: "errorMsg",
        value: "Failed to submit ticket. Please try again.",
      });
    } finally {
      dispatch({
        type: FormActionType.SET,
        key: "submitLoading",
        value: false,
      });
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

  return (
    <div className="min-h-screen bg-background py-6 sm:py-10 text-left font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Help Center Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-3">
            {SUPPORT_PAGE_TEXT.TITLE}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {SUPPORT_PAGE_TEXT.SUBTITLE}
          </p>
        </div>
        {/* Custom Tab Selector */}
        <div className="flex border-b border-border mb-8 overflow-x-auto gap-2">
          <button
            onClick={() =>
              uiDispatch({
                type: UIActionType.SET,
                key: "activeTab",
                value: "faq",
              })
            }
            className={`px-5 py-3 font-bold text-xs border-b-2 transition-all shrink-0 cursor-pointer ${
              uiState.activeTab === "faq"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {SUPPORT_PAGE_TEXT.TAB_FAQ}
          </button>
          <button
            onClick={() => {
              uiDispatch({
                type: UIActionType.SET,
                key: "activeTab",
                value: "tickets",
              });
              fetchTickets();
            }}
            className={`px-5 py-3 font-bold text-xs border-b-2 transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              uiState.activeTab === "tickets"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {SUPPORT_PAGE_TEXT.TAB_TICKETS}
            {dataState.tickets.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-secondary text-foreground rounded-full border border-border">
                {dataState.tickets.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              uiDispatch({
                type: UIActionType.SET,
                key: "activeTab",
                value: "returns",
              });
              fetchReturns();
            }}
            className={`px-5 py-3 font-bold text-xs border-b-2 transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              uiState.activeTab === "returns"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {SUPPORT_PAGE_TEXT.TAB_RETURNS}
            {dataState.returnsList.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-secondary text-foreground rounded-full border border-border">
                {dataState.returnsList.length}
              </span>
            )}
          </button>
        </div>
        {/* Tab content 1: FAQ & Contact Form */}
        {uiState.activeTab === "faq" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: FAQs & Returns CTA */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              {/* Returns Entry Point Call-To-Action */}
              <div className="bg-gradient-to-r from-theme-primary to-theme-secondary text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                <div className="text-center sm:text-left">
                  <h3 className="text-sm sm:text-base font-bold mb-1">
                    {SUPPORT_PAGE_TEXT.RETURN_CTA_TITLE}
                  </h3>
                  <p className="text-white/80 text-xs font-semibold">
                    {SUPPORT_PAGE_TEXT.RETURN_CTA_DESC}
                  </p>
                </div>
                <Link
                  href="/customer/orders"
                  className="w-full sm:w-auto bg-background text-foreground hover:bg-secondary transition-all px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shrink-0 shadow-sm active:scale-95"
                >
                  <PackageSearch className="w-4.5 h-4.5" />{" "}
                  {SUPPORT_PAGE_TEXT.RETURN_CTA_ACTION}
                </Link>
              </div>

              {/* FAQs */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    {SUPPORT_PAGE_TEXT.FAQ_SECTION_TITLE}
                  </h2>
                  <div className="w-full sm:w-64">
                    <div className="relative">
                      <input
                        value={uiState.searchQuery}
                        onChange={(e) =>
                          uiDispatch({
                            type: UIActionType.SET,
                            key: "searchQuery",
                            value: e.target.value,
                          })
                        }
                        placeholder={SUPPORT_PAGE_TEXT.FAQ_SEARCH_PLACEHOLDER}
                        className="w-full text-xs px-4 py-2 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                      />

                      <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {dataState.loadingHelpArticles ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Loading FAQs...
                      </p>
                    </div>
                  ) : FAQS_FILTERED.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-secondary/20">
                      <p className="text-xs text-muted-foreground font-semibold">
                        {SUPPORT_PAGE_TEXT.FAQ_NO_MATCHES}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {SUPPORT_PAGE_TEXT.FAQ_NO_MATCHES_DESC}
                      </p>
                    </div>
                  ) : (
                    FAQS_FILTERED.map((faq, idx) => (
                      <div
                        key={faq.id}
                        className="bg-card border border-border rounded-xl overflow-hidden transition-all shadow-sm"
                      >
                        <button
                          onClick={() =>
                            uiDispatch({
                              type: UIActionType.SET,
                              key: "openFaqIndex",
                              value: uiState.openFaqIndex === idx ? null : idx,
                            })
                          }
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none cursor-pointer"
                        >
                          <span className="font-bold text-foreground text-xs sm:text-sm">
                            {faq.title}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform ${uiState.openFaqIndex === idx ? "rotate-180" : ""}`}
                          />
                        </button>
                        {uiState.openFaqIndex === idx && (
                          <div className="px-5 pb-5 text-muted-foreground text-xs border-t border-border pt-3 leading-relaxed">
                            <div className="mb-3 whitespace-pre-wrap">
                              {faq.content}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-muted-foreground">
                                {SUPPORT_PAGE_TEXT.FAQ_HELPFUL_PROMPT}
                              </span>
                              <button
                                onClick={async () => {
                                  const next = {
                                    ...uiState.faqVotes,
                                    [faq.id]: "up",
                                  };
                                  uiDispatch({
                                    type: UIActionType.SET,
                                    key: "faqVotes",
                                    value: next,
                                  });
                                  try {
                                    localStorage.setItem(
                                      "tn_faq_votes",
                                      JSON.stringify(next),
                                    );
                                    await AxiosAPI.post(
                                      `/v1/help-articles/${faq.id}/vote`,
                                      { isHelpful: true },
                                    );
                                  } catch {}
                                  toast.success(
                                    SUPPORT_PAGE_TEXT.FAQ_FEEDBACK_THANKS,
                                  );
                                }}
                                className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer ${uiState.faqVotes[faq.id] === "up" ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-foreground"}`}
                              >
                                {SUPPORT_PAGE_TEXT.FAQ_HELPFUL_YES}
                              </button>
                              <button
                                onClick={async () => {
                                  const next = {
                                    ...uiState.faqVotes,
                                    [faq.id]: "down",
                                  };
                                  uiDispatch({
                                    type: UIActionType.SET,
                                    key: "faqVotes",
                                    value: next,
                                  });
                                  try {
                                    localStorage.setItem(
                                      "tn_faq_votes",
                                      JSON.stringify(next),
                                    );
                                    await AxiosAPI.post(
                                      `/v1/help-articles/${faq.id}/vote`,
                                      { isHelpful: false },
                                    );
                                  } catch {}
                                  toast(
                                    SUPPORT_PAGE_TEXT.FAQ_FEEDBACK_IMPROVE,
                                    {
                                      icon: "ℹ️",
                                    },
                                  );
                                }}
                                className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer ${uiState.faqVotes[faq.id] === "down" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"}`}
                              >
                                {SUPPORT_PAGE_TEXT.FAQ_HELPFUL_NO}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Create Ticket Form */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 font-sans">
                <h2 className="text-theme-h6 font-bold text-foreground mb-1">
                  {SUPPORT_PAGE_TEXT.TICKET_FORM_TITLE}
                </h2>
                <p className="text-theme-caption text-muted-foreground mb-6">
                  {SUPPORT_PAGE_TEXT.TICKET_FORM_DESC}
                </p>

                {!isAuthenticated ? (
                  <div className="border border-dashed border-border rounded-xl p-6 text-center">
                    <p className="text-theme-body-sm text-muted-foreground mb-4">
                      {SUPPORT_PAGE_TEXT.TICKET_AUTH_PROMPT}
                    </p>
                    <Link
                      href={CUSTOMER_LOGIN_PATH}
                      className="w-full inline-block text-center bg-foreground text-background font-bold py-3 rounded-xl hover:bg-foreground/90 transition-all shadow-sm text-theme-body-sm cursor-pointer"
                    >
                      {SUPPORT_PAGE_TEXT.TICKET_AUTH_BUTTON}
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    {formState.errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-655 text-theme-caption">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                        <span>{formState.errorMsg}</span>
                      </div>
                    )}

                    {formState.successMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-755 text-theme-caption">
                        <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                        <span>{formState.successMsg}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Issue Category
                      </label>
                      <select
                        value={formState.category}
                        onChange={(e) =>
                          dispatch({
                            type: FormActionType.SET,
                            key: "category",
                            value: e.target.value,
                          })
                        }
                        className="w-full text-theme-body-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-700"
                      >
                        <option value="Order Issues">Order Issues</option>
                        <option value="Payment & Refunds">
                          Payment & Refunds
                        </option>
                        <option value="Account Settings">
                          Account Settings
                        </option>
                      </select>
                    </div>

                    {/* Order selector for order-related categories */}
                    {(formState.category === "Order Issues" ||
                      formState.category === "Payment & Refunds") && (
                      <div>
                        <label className="block text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Link Order Item (Optional)
                        </label>
                        {dataState.loadingOrders ? (
                          <div className="flex items-center gap-2 px-3 py-2 border rounded-xl bg-gray-50">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            <span className="text-theme-caption text-gray-400">
                              Loading order history...
                            </span>
                          </div>
                        ) : dataState.orderItems.length === 0 ? (
                          <div className="text-theme-caption text-gray-400 p-3 border rounded-xl bg-gray-50">
                            No recent purchases found to link.
                          </div>
                        ) : (
                          <select
                            value={formState.linkedOrderItemId}
                            onChange={(e) => {
                              const itemId = e.target.value;
                              dispatch({
                                type: FormActionType.SET,
                                key: "linkedOrderItemId",
                                value: itemId,
                              });
                              const selectedItem = dataState.orderItems.find(
                                (item) => item.id === itemId,
                              );
                              dispatch({
                                type: FormActionType.SET,
                                key: "linkedOrderId",
                                value: selectedItem?.order?.id || "",
                              });
                            }}
                            className="w-full text-theme-caption px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-700"
                          >
                            <option value="">-- Do Not Link --</option>
                            {dataState.orderItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.variant?.variant_name} - ₹
                                {formatCurrency(Number(item.price))} (
                                {formatDate(item.created_at)})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formState.subject}
                        onChange={(e) =>
                          dispatch({
                            type: FormActionType.SET,
                            key: "subject",
                            value: e.target.value,
                          })
                        }
                        placeholder="Brief summary of the issue"
                        className="w-full text-theme-body-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        value={formState.message}
                        onChange={(e) =>
                          dispatch({
                            type: FormActionType.SET,
                            key: "message",
                            value: e.target.value,
                          })
                        }
                        placeholder="Detailed description..."
                        className="w-full text-theme-body-sm p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400 font-medium resize-none"
                        required
                      />
                    </div>

                    {/* Screenshot / File Attachment */}
                    <div>
                      <label className="block text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Attach Screenshot (Optional)
                      </label>
                      <div className="mt-1 flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="ticket-file-input"
                          disabled={formState.uploadingFile}
                        />

                        {!formState.attachmentUrl ? (
                          <label
                            htmlFor="ticket-file-input"
                            className={`cursor-pointer px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-theme-caption font-bold text-gray-700 transition-colors flex items-center gap-2 ${
                              formState.uploadingFile
                                ? "opacity-50 pointer-events-none"
                                : ""
                            }`}
                          >
                            <Upload size={14} />
                            {formState.uploadingFile
                              ? "Uploading..."
                              : "Upload Screenshot"}
                          </label>
                        ) : (
                          <div className="flex items-center gap-2 bg-secondary border border-border px-3 py-1.5 rounded-xl text-theme-caption font-semibold text-foreground">
                            <span className="truncate max-w-[150px]">
                              {formState.selectedFile?.name || "attachment.png"}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="text-muted-foreground hover:text-foreground ml-1.5 focus:outline-none cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        {formState.uploadingFile && (
                          <Loader2 className="w-4.5 h-4.5 text-primary animate-spin" />
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        formState.submitLoading || formState.uploadingFile
                      }
                      className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold py-3 rounded-xl transition-all shadow-sm disabled:bg-muted disabled:text-muted-foreground flex items-center justify-center gap-2 text-theme-body-sm mt-2 cursor-pointer"
                    >
                      {formState.submitLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {formState.submitLoading
                        ? SUPPORT_PAGE_TEXT.TICKET_FORM_SUBMITTING
                        : SUPPORT_PAGE_TEXT.TICKET_FORM_SUBMIT}
                    </button>
                  </form>
                )}

                <div className="mt-6 pt-6 border-t border-border flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
                    <Headphones className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-theme-body-sm font-bold text-foreground font-sans">
                      {SUPPORT_PAGE_TEXT.TICKET_FAST_HELP_TITLE}
                    </p>
                    <p className="text-theme-caption font-medium text-muted-foreground font-sans">
                      {SUPPORT_PAGE_TEXT.TICKET_FAST_HELP_DESC}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Tab content 2: Support Tickets list */}
        {uiState.activeTab === "tickets" && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 font-sans">
            <h2 className="text-theme-h5 font-bold text-foreground mb-6">
              {SUPPORT_PAGE_TEXT.TICKET_LIST_TITLE}
            </h2>

            {!isAuthenticated ? (
              <div className="text-center py-12">
                <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-bold mb-1">
                  {SUPPORT_PAGE_TEXT.TICKET_AUTH_LIST_PROMPT}
                </p>
                <p className="text-theme-caption text-muted-foreground mb-6">
                  {SUPPORT_PAGE_TEXT.TICKET_AUTH_LIST_DESC}
                </p>
                <Link
                  href={CUSTOMER_LOGIN_PATH}
                  className="bg-foreground hover:bg-foreground/90 text-background font-bold px-6 py-2.5 rounded-xl text-theme-body-sm transition-colors shadow-sm cursor-pointer"
                >
                  {SUPPORT_PAGE_TEXT.TICKET_AUTH_LIST_BUTTON}
                </Link>
              </div>
            ) : dataState.loadingTickets ? (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-theme-body-sm text-muted-foreground">
                  {SUPPORT_PAGE_TEXT.TICKET_LIST_LOADING}
                </p>
              </div>
            ) : dataState.tickets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border rounded-2xl bg-card p-6"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 border border-border">
                  <Headphones className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {SUPPORT_PAGE_TEXT.TICKET_LIST_EMPTY}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-6">
                  {SUPPORT_PAGE_TEXT.TICKET_LIST_EMPTY_DESC}
                </p>
                <button
                  onClick={() =>
                    uiDispatch({
                      type: UIActionType.SET,
                      key: "activeTab",
                      value: "faq",
                    })
                  }
                  className="bg-foreground hover:bg-foreground/90 text-background text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  {SUPPORT_PAGE_TEXT.TICKET_LIST_EMPTY_ACTION}
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {dataState.tickets.map((ticket) => {
                  const isExpanded = uiState.expandedTicketId === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      className="border border-border bg-card rounded-xl overflow-hidden shadow-sm transition-all hover:border-border/80"
                    >
                      {/* Ticket Row Bar */}
                      <div
                        onClick={() =>
                          uiDispatch({
                            type: UIActionType.SET,
                            key: "expandedTicketId",
                            value: isExpanded ? null : ticket.id,
                          })
                        }
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 gap-3 cursor-pointer hover:bg-secondary/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-theme-body-sm font-bold text-foreground capitalize">
                              {ticket.category || "General"}
                            </span>
                            <span className="text-theme-caption text-muted-foreground font-medium">
                              #{ticket.id.slice(0, 8)}
                            </span>
                          </div>
                          <p className="text-theme-body-sm font-semibold text-muted-foreground line-clamp-1">
                            {ticket.subject}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                          <span
                            className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border shrink-0 ${getStatusColor(ticket.status)}`}
                          >
                            {ticket.status}
                          </span>
                          <span className="text-theme-caption text-muted-foreground shrink-0 font-medium">
                            {formatDate(ticket.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Ticket Details Expanded */}
                      {isExpanded && (
                        <div className="bg-secondary/20 border-t border-border p-5 space-y-4 text-theme-body-sm">
                          <div>
                            <h4 className="text-theme-caption font-bold text-muted-foreground uppercase tracking-wider mb-1">
                              {SUPPORT_PAGE_TEXT.TICKET_EXPAND_DESC_TITLE}
                            </h4>
                            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                              {ticket.description}
                            </p>
                          </div>

                          {/* Order / Attachment References */}
                          {(ticket.order_id || ticket.attachment_url) && (
                            <div className="flex flex-wrap gap-4 pt-3 border-t border-border">
                              {ticket.order_id && (
                                <div className="flex items-center gap-2 bg-card px-3 py-2 border border-border rounded-xl text-theme-caption font-semibold text-foreground">
                                  <LinkIcon
                                    size={14}
                                    className="text-muted-foreground"
                                  />

                                  <span>
                                    {
                                      SUPPORT_PAGE_TEXT.TICKET_EXPAND_LINKED_ORDER
                                    }
                                    {ticket.order_id.slice(0, 8)}
                                  </span>
                                  <Link
                                    href={`/customer/orders/${ticket.order_id}`}
                                    className="text-primary hover:text-primary/80 font-bold ml-1.5 flex items-center gap-0.5"
                                  >
                                    {SUPPORT_PAGE_TEXT.TICKET_EXPAND_VIEW_ORDER}{" "}
                                    <ArrowRight size={12} />
                                  </Link>
                                </div>
                              )}

                              {ticket.attachment_url && (
                                <div className="flex items-center gap-2 bg-card px-3 py-2 border border-border rounded-xl text-theme-caption font-semibold text-foreground">
                                  <FileText
                                    size={14}
                                    className="text-muted-foreground"
                                  />

                                  <span>
                                    {
                                      SUPPORT_PAGE_TEXT.TICKET_EXPAND_ATTACHMENT_PREVIEW
                                    }
                                  </span>
                                  <a
                                    href={ticket.attachment_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary hover:text-primary/80 font-bold ml-1"
                                  >
                                    {
                                      SUPPORT_PAGE_TEXT.TICKET_EXPAND_ATTACHMENT_OPEN
                                    }
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Quick thumbnail of attachment */}
                          {ticket.attachment_url && (
                            <div className="mt-2 w-32 h-32 rounded-xl border border-border overflow-hidden bg-card p-1">
                              <img
                                src={ticket.attachment_url}
                                alt="Support attachment"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}

                          {/* Ticket comment thread and post-resolution satisfaction rating form */}
                          <TicketThread
                            ticketId={ticket.id}
                            userId={user?.id || ""}
                            ticketStatus={ticket.status}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}{" "}
        {/* Tab content 3: Returns list tracker */}
        {uiState.activeTab === "returns" && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 font-sans">
            <h2 className="text-theme-h5 font-bold text-foreground mb-6">
              {SUPPORT_PAGE_TEXT.RETURNS_LIST_TITLE}
            </h2>

            {!isAuthenticated ? (
              <div className="text-center py-12">
                <PackageSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-bold mb-1">
                  {SUPPORT_PAGE_TEXT.RETURNS_AUTH_PROMPT}
                </p>
                <p className="text-theme-caption text-muted-foreground mb-6">
                  {SUPPORT_PAGE_TEXT.RETURNS_AUTH_DESC}
                </p>
                <Link
                  href={CUSTOMER_LOGIN_PATH}
                  className="bg-foreground hover:bg-foreground/90 text-background font-bold px-6 py-2.5 rounded-xl text-theme-body-sm transition-colors shadow-sm cursor-pointer"
                >
                  {SUPPORT_PAGE_TEXT.RETURNS_AUTH_BUTTON}
                </Link>
              </div>
            ) : dataState.loadingReturns ? (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-theme-body-sm text-muted-foreground">
                  {SUPPORT_PAGE_TEXT.RETURNS_LIST_LOADING}
                </p>
              </div>
            ) : dataState.returnsList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border rounded-2xl bg-card p-6"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 border border-border">
                  <PackageSearch className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {SUPPORT_PAGE_TEXT.RETURNS_LIST_EMPTY}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-6">
                  {SUPPORT_PAGE_TEXT.RETURNS_LIST_EMPTY_DESC}
                </p>
                <Link
                  href="/customer/orders"
                  className="bg-foreground hover:bg-foreground/90 text-background text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  {SUPPORT_PAGE_TEXT.RETURNS_LIST_EMPTY_ACTION}
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {dataState.returnsList.map((returnReq) => {
                  const typeLabel =
                    returnReq.type === "return"
                      ? "Return Request"
                      : returnReq.type === "replacement"
                        ? "Replacement Request"
                        : "Refund Request";
                  const variant = returnReq.orderItem?.variant;
                  const primaryImage = variant?.images?.[0]?.image_url;

                  return (
                    <div
                      key={returnReq.id}
                      className="border border-border bg-card rounded-2xl p-5 sm:p-6 shadow-sm transition-all hover:border-border/80"
                    >
                      {/* Return Header summary */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 mb-4 gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-theme-body-sm font-extrabold text-primary uppercase tracking-wide">
                              {typeLabel}
                            </span>
                            <span className="text-theme-caption text-muted-foreground font-medium">
                              #{returnReq.id.slice(0, 8)}
                            </span>
                          </div>
                          <p className="text-theme-caption text-muted-foreground font-semibold mt-0.5">
                            {SUPPORT_PAGE_TEXT.RETURNS_SUBMITTED_ON}{" "}
                            {formatDate(returnReq.created_at)}
                          </p>
                        </div>
                        <span className="text-theme-caption font-bold text-foreground bg-secondary px-3 py-1 rounded-md capitalize">
                          {SUPPORT_PAGE_TEXT.RETURNS_REASON_LABEL}{" "}
                          {returnReq.reason}
                        </span>
                      </div>

                      {/* Product details info if loaded */}
                      {variant && (
                        <div className="flex gap-4 items-center mb-6">
                          <div className="w-16 h-16 bg-secondary rounded-xl border border-border p-1 overflow-hidden flex items-center justify-center shrink-0">
                            <img
                              src={
                                primaryImage ||
                                "https://placehold.co/400x400/f8fafc/94a3b8?text=Product"
                              }
                              alt={variant.variant_name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-foreground text-theme-body-sm sm:text-theme-body truncate">
                              {variant.variant_name}
                            </h4>
                            <p className="font-extrabold text-muted-foreground text-theme-caption sm:text-theme-body-sm mt-0.5">
                              ₹{formatCurrency(Number(variant.price))}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Progress Tracker timeline */}
                      {renderReturnTimeline(returnReq)}

                      {/* Tracking / Shipping Labels Section */}
                      {(returnReq.return_label_url ||
                        returnReq.outbound_tracking_number ||
                        returnReq.return_tracking_number ||
                        returnReq.tracking_id) && (
                        <div className="mt-6 p-4 bg-secondary border border-border rounded-2xl space-y-3">
                          <h5 className="text-theme-caption font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                            <LinkIcon className="w-3.5 h-3.5" />
                            {SUPPORT_PAGE_TEXT.RETURNS_TRACKING_SECTION_TITLE}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-theme-caption">
                            {returnReq.outbound_tracking_number && (
                              <div>
                                <span className="text-theme-tiny text-muted-foreground font-bold uppercase tracking-wider block">
                                  {SUPPORT_PAGE_TEXT.RETURNS_OUTBOUND_TRACKING}
                                </span>
                                <span className="font-semibold text-foreground">
                                  {returnReq.outbound_tracking_number}
                                </span>
                              </div>
                            )}
                            {returnReq.return_tracking_number && (
                              <div>
                                <span className="text-theme-tiny text-muted-foreground font-bold uppercase tracking-wider block">
                                  {SUPPORT_PAGE_TEXT.RETURNS_RETURN_TRACKING}
                                </span>
                                <span className="font-semibold text-foreground">
                                  {returnReq.return_tracking_number}
                                </span>
                              </div>
                            )}
                            {returnReq.tracking_id && (
                              <div>
                                <span className="text-theme-tiny text-muted-foreground font-bold uppercase tracking-wider block">
                                  {SUPPORT_PAGE_TEXT.RETURNS_CARRIER_REF}
                                </span>
                                <span className="font-semibold text-foreground">
                                  {returnReq.tracking_id}
                                </span>
                              </div>
                            )}
                            {returnReq.return_label_url && (
                              <div>
                                <span className="text-theme-tiny text-muted-foreground font-bold uppercase tracking-wider block">
                                  {SUPPORT_PAGE_TEXT.RETURNS_SHIPPING_LABEL}
                                </span>
                                <a
                                  href={returnReq.return_label_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 font-bold underline flex items-center gap-1 mt-0.5"
                                >
                                  {SUPPORT_PAGE_TEXT.RETURNS_DOWNLOAD_LABEL}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
