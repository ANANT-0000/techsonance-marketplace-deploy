'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchProductSuggestions } from '@/utils/commonAPiClient';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChange, onSearch, placeholder = 'Search products...' }: SearchBarProps) {
    const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch suggestions with debounce (P2)
    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        setIsLoadingSuggestions(true);
        const results = await fetchProductSuggestions(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsLoadingSuggestions(false);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [value, fetchSuggestions]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setShowSuggestions(false);
            onSearch(value);
        }
        if (e.key === 'Escape') {
            setShowSuggestions(false);
            inputRef.current?.blur();
        }
    };

    const handleSuggestionClick = (name: string) => {
        onChange(name);
        setShowSuggestions(false);
        onSearch(name);
    };

    const handleClear = () => {
        onChange('');
        setSuggestions([]);
        setShowSuggestions(false);
        onSearch('');
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Input */}
            <div
                className={`flex items-center gap-2 border-2 rounded-xl px-4 py-2.5 bg-white transition-all duration-200 ${
                    isFocused ? 'border-blue-500 shadow-sm shadow-blue-100' : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                <Search size={18} className={`flex-shrink-0 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        setIsFocused(true);
                        if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder={placeholder}
                    className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent min-w-0"
                />
                <AnimatePresence>
                    {value && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.15 }}
                            onClick={handleClear}
                            className="flex-shrink-0 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X size={14} />
                        </motion.button>
                    )}
                </AnimatePresence>
                {isLoadingSuggestions && (
                    <Loader2 size={14} className="flex-shrink-0 text-blue-400 animate-spin" />
                )}
            </div>

            {/* Suggestions Dropdown (P2) */}
            <AnimatePresence>
                {showSuggestions && isFocused && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{ transformOrigin: 'top' }}
                        className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                    >
                        <ul className="py-1.5 max-h-64 overflow-y-auto">
                            {suggestions.map((s, i) => (
                                <li key={s.id}>
                                    <button
                                        onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                                        onClick={() => handleSuggestionClick(s.name)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                                    >
                                        <Search size={13} className="text-gray-300 flex-shrink-0" />
                                        {/* Highlight matching portion */}
                                        <SuggestionText text={s.name} query={value} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Highlight the matching part of the suggestion text
function SuggestionText({ text, query }: { text: string; query: string }) {
    if (!query) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <mark className="bg-blue-100 text-blue-700 rounded-sm">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </span>
    );
}
