'use client';
/**
 * SearchOverlay.tsx — Phase 2 + 3
 *
 * A single component that handles both desktop and mobile search UX:
 *
 * Desktop (≥ lg):
 *   A command-palette style overlay drops from the navbar. It shows
 *   suggestions and recent searches inline; submitting routes to /store/shop.
 *   The palette opens/closes with a smooth scale+opacity spring.
 *
 * Mobile (< lg):
 *   A full-screen slide-up drawer covers the viewport. It shows the same
 *   input + suggestions. Submitting routes to /store/shop.
 *   The drawer closes with a slide-down exit.
 *
 * Usage:
 *   Place <SearchTrigger /> anywhere in your navbar. It renders the trigger
 *   button and mounts the overlay portal when open.
 *
 *   Or use <SearchOverlay open={…} onClose={…} /> standalone if you already
 *   manage open state in the navbar.
 */

import { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchProductSuggestions } from '@/utils/commonAPiClient';
import { SEARCH_OVERLAY_TEXT } from '@/constants/customerText';

// ─── Constants ────────────────────────────────────────────────────────────────

// Single route constant — change here if the shopping page ever moves
const SHOP_ROUTE = '/store';

const RECENT_KEY = 'ts_recent_searches';
const MAX_RECENT = 6;

function getRecent(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    } catch {
        return [];
    }
}

function pushRecent(term: string) {
    const prev = getRecent().filter((t) => t !== term);
    localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, MAX_RECENT)));
}

function removeRecent(term: string) {
    const next = getRecent().filter((t) => t !== term);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

// ─── State ────────────────────────────────────────────────────────────────────

interface OverlayState {
    query: string;
    suggestions: { id: string; name: string }[];
    recent: string[];
    isLoading: boolean;
}

enum OA {
    SET_QUERY = 'SET_QUERY',
    SET_SUGGESTIONS = 'SET_SUGGESTIONS',
    SET_RECENT = 'SET_RECENT',
    SET_LOADING = 'SET_LOADING',
}

type OAction =
    | { type: OA.SET_QUERY; payload: string }
    | { type: OA.SET_SUGGESTIONS; payload: { id: string; name: string }[] }
    | { type: OA.SET_RECENT; payload: string[] }
    | { type: OA.SET_LOADING; payload: boolean };

function overlayReducer(state: OverlayState, action: OAction): OverlayState {
    switch (action.type) {
        case OA.SET_QUERY: return { ...state, query: action.payload };
        case OA.SET_SUGGESTIONS: return { ...state, suggestions: action.payload };
        case OA.SET_RECENT: return { ...state, recent: action.payload };
        case OA.SET_LOADING: return { ...state, isLoading: action.payload };
        default: return state;
    }
}

// ─── Suggestion highlight helper ──────────────────────────────────────────────

function HighlightMatch({ text, query }: { text: string; query: string }) {
    const q = query.trim();
    if (!q) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <mark className="bg-blue-100 text-blue-700 rounded-[3px] not-italic">
                {text.slice(idx, idx + q.length)}
            </mark>
            {text.slice(idx + q.length)}
        </span>
    );
}

// ─── Core overlay body (shared between desktop + mobile) ──────────────────────

interface OverlayBodyProps {
    onClose: () => void;
    /** If provided, the input is autofocused with this initial value */
    initialQuery?: string;
}

function OverlayBody({ onClose, initialQuery = '' }: OverlayBodyProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [state, dispatch] = useReducer(overlayReducer, {
        query: initialQuery,
        suggestions: [],
        recent: [],
        isLoading: false,
    });

    // Load recent on mount
    useEffect(() => {
        dispatch({ type: OA.SET_RECENT, payload: getRecent() });
        inputRef.current?.focus();
    }, []);

    // Debounced suggestion fetch
    const fetchSuggestions = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            dispatch({ type: OA.SET_SUGGESTIONS, payload: [] });
            return;
        }
        dispatch({ type: OA.SET_LOADING, payload: true });
        try {
            const results = await fetchProductSuggestions(q);
            dispatch({ type: OA.SET_SUGGESTIONS, payload: results });
        } catch {
            dispatch({ type: OA.SET_SUGGESTIONS, payload: [] });
        } finally {
            dispatch({ type: OA.SET_LOADING, payload: false });
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(state.query), 280);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [state.query, fetchSuggestions]);

    const submitSearch = (term: string) => {
        const t = term.trim();
        if (!t) return;
        pushRecent(t);
        onClose();
        router.push(`${SHOP_ROUTE}?search=${encodeURIComponent(t)}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') submitSearch(state.query);
        if (e.key === 'Escape') onClose();
    };

    const handleRemoveRecent = (term: string, e: React.MouseEvent) => {
        e.stopPropagation();
        removeRecent(term);
        dispatch({ type: OA.SET_RECENT, payload: getRecent() });
    };

    const showSuggestions = state.query.trim().length >= 2;
    const showRecent = !showSuggestions && state.recent.length > 0;

    return (
        <div className="flex flex-col w-full">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={state.query}
                    onChange={(e) => dispatch({ type: OA.SET_QUERY, payload: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder={SEARCH_OVERLAY_TEXT.PLACEHOLDER}
                    className="flex-1 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                />
                <div className="flex items-center gap-2 shrink-0">
                    {state.isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    {state.query && (
                        <button
                            onClick={() => dispatch({ type: OA.SET_QUERY, payload: '' })}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto max-h-[60vh] py-3">
                <AnimatePresence mode="wait">
                    {/* Auto-suggestions */}
                    {showSuggestions && (
                        <motion.div
                            key="suggestions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                        >
                            <p className="px-5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {SEARCH_OVERLAY_TEXT.SUGGESTED_PRODUCTS}
                            </p>
                            {state.suggestions.length === 0 && !state.isLoading ? (
                                <p className="px-5 py-6 text-sm text-gray-400 text-center">
                                    {SEARCH_OVERLAY_TEXT.NO_MATCHES} <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-600">Enter</kbd> {SEARCH_OVERLAY_TEXT.TO_SEARCH_ANYWAY}
                                </p>
                            ) : (
                                state.suggestions.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => submitSearch(s.name)}
                                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left group"
                                    >
                                        <Search className="w-4 h-4 text-gray-300 shrink-0" />
                                        <span className="flex-1 text-sm text-gray-700 truncate">
                                            <HighlightMatch text={s.name} query={state.query} />
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                                    </button>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Recent searches */}
                    {showRecent && (
                        <motion.div
                            key="recent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                        >
                            <p className="px-5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {SEARCH_OVERLAY_TEXT.RECENT_SEARCHES}
                            </p>
                            {state.recent.map((term) => (
                                <button
                                    key={term}
                                    onClick={() => submitSearch(term)}
                                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left group"
                                >
                                    <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                                    <span className="flex-1 text-sm text-gray-600 truncate">{term}</span>
                                    <button
                                        onClick={(e) => handleRemoveRecent(term, e)}
                                        className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-gray-200"
                                    >
                                        <X className="w-3 h-3 text-gray-400" />
                                    </button>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* Default: trending / empty prompt */}
                    {!showSuggestions && !showRecent && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="px-5 py-6 flex flex-col items-center gap-2 text-center"
                        >
                            <TrendingUp className="w-8 h-8 text-gray-200" />
                            <p className="text-sm text-gray-400">{SEARCH_OVERLAY_TEXT.START_TYPING}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Desktop command palette ───────────────────────────────────────────────────

interface DesktopPaletteProps {
    open: boolean;
    onClose: () => void;
    anchorRef?: React.RefObject<HTMLElement | null>;
}

function DesktopPalette({ open, onClose, anchorRef }: DesktopPaletteProps) {
    // Close on outside click
    const paletteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                paletteRef.current &&
                !paletteRef.current.contains(e.target as Node) &&
                (!anchorRef?.current || !anchorRef.current.contains(e.target as Node))
            ) {
                onClose();
            }
        };
        // Small delay so the trigger click doesn't immediately close
        const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
        return () => {
            clearTimeout(t);
            document.removeEventListener('mousedown', handler);
        };
    }, [open, onClose, anchorRef]);

    // Keyboard escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={paletteRef}
                    initial={{ opacity: 0, scale: 0.97, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: -6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute top-full right-0 mt-2 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                >
                    <OverlayBody onClose={onClose} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Mobile full-screen drawer ─────────────────────────────────────────────────

interface MobileDrawerProps {
    open: boolean;
    onClose: () => void;
}

function MobileDrawer({ open, onClose }: MobileDrawerProps) {
    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    {/* Drawer */}
                    <motion.div
                        key="drawer"
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        className="fixed inset-x-0 top-0 z-50 bg-white rounded-b-3xl shadow-2xl"
                    >
                        {/* Drag handle */}
                        <div className="flex items-center justify-between px-5 pt-4 pb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{SEARCH_OVERLAY_TEXT.SEARCH_UPPER}</span>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <OverlayBody onClose={onClose} />
                        {/* Safe area padding for iOS */}
                        <div className="pb-safe-bottom h-4" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body,
    );
}

// ─── Public exports ────────────────────────────────────────────────────────────

/**
 * SearchTrigger — drop this into your Navbar.
 *
 * On mobile it renders a plain Search icon button that opens the mobile drawer.
 * On desktop it renders a pill input (or icon) that opens the command palette
 * anchored to itself.
 *
 * Props:
 *   className — forwarded to the wrapping div
 */
export function SearchTrigger({ className }: { className?: string }) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
        <div className={`relative ${className ?? ''}`}>
            {/* Desktop palette trigger */}
            <button
                ref={triggerRef}
                onClick={() => setOpen((v) => !v)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-500 font-medium transition-colors min-w-[200px]"
                aria-label="Open search"
            >
                <Search className="w-4 h-4 text-gray-400" />
                <span>{SEARCH_OVERLAY_TEXT.SEARCH_TRIGGER}</span>
                <kbd className="ml-auto text-[10px] font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">
                    ⌘K
                </kbd>
            </button>

            {/* Mobile icon trigger */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                aria-label="Open search"
            >
                <Search className="w-5 h-5" />
            </button>

            {/* Desktop palette (anchored to this trigger) */}
            <div className="hidden lg:block">
                <DesktopPalette
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorRef={triggerRef as React.RefObject<HTMLElement>}
                />
            </div>

            {/* Mobile drawer (portal to body) */}
            <div className="lg:hidden">
                <MobileDrawer open={open} onClose={() => setOpen(false)} />
            </div>
        </div>
    );
}

/**
 * ⌘K keyboard shortcut — mount this once at the app root or layout.
 * Opens the search overlay when the user presses Cmd/Ctrl + K.
 */
// export function SearchKeyboardShortcut() {
//     const [open, setOpen] = useState(false);

//     useEffect(() => {
//         const handler = (e: KeyboardEvent) => {
//             if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
//                 e.preventDefault();
//                 setOpen((v) => !v);
//             }
//         };
//         document.addEventListener('keydown', handler);
//         return () => document.removeEventListener('keydown', handler);
//     }, []);

//     return (
//         <>
//             {/* Desktop — centered modal style for ⌘K */}
//             <AnimatePresence>
//                 {open && (
//                     <>
//                         <motion.div
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                             className="hidden lg:block fixed inset-0 bg-black/25 backdrop-blur-sm z-40"
//                             onClick={() => setOpen(false)}
//                         />
//                         <motion.div
//                             initial={{ opacity: 0, scale: 0.96, y: -12 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.96, y: -12 }}
//                             transition={{ type: 'spring', stiffness: 420, damping: 32 }}
//                             className="hidden lg:block fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
//                         >
//                             <OverlayBody onClose={() => setOpen(false)} />
//                         </motion.div>
//                     </>
//                 )}
//             </AnimatePresence>

//             {/* Mobile drawer */}
//             <MobileDrawer open={open} onClose={() => setOpen(false)} />
//         </>
//     );
// }