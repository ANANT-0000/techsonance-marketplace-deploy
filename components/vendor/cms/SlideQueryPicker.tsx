"use client";
import { UiText } from "@/constants/ui-text";
import AxiosAPI from "@/lib/axios";
import { useCallback, useEffect, useRef, useState } from "react";

export function SlideQueryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [categories, setCategories] = useState<string[]>([]);
  const [productTags, setProductTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(() =>
    value ? value.split(" ").filter(Boolean) : [],
  );
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const didFetch = useRef(false);

  // Fetch categories + product names once
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          AxiosAPI.get("/v1/categories"),
          AxiosAPI.get("/v1/products?limit=100"),
        ]);
        // Categories
        const cats: string[] = (catRes.data?.data ?? catRes.data ?? [])
          .map((c: any) => c.name)
          .filter(Boolean);
        // Product names (take first word of each, deduplicated, max 40 tags)
        const rawProds: any[] = prodRes.data?.data ?? [];
        const words = new Set<string>();
        rawProds.forEach((p: any) => {
          if (p.name) {
            // Add full name as a tag
            words.add(p.name.trim());
            // Also split into individual keywords (≥4 chars)
            p.name.split(/\s+/).forEach((w: string) => {
              if (w.length >= 4) words.add(w.toLowerCase());
            });
          }
          if (p.category?.name) words.add(p.category.name.trim());
        });
        const prodArr = Array.from(words).slice(0, 50);
        setCategories(cats);
        setProductTags(prodArr);
      } catch {
        setCategories([]);
        setProductTags([]);
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  // Sync inbound value → selected chips (if parent changes)
  useEffect(() => {
    const incoming = value ? value.split(" ").filter(Boolean) : [];
    setSelected(incoming);
  }, [value]);

  const toggle = useCallback(
    (tag: string) => {
      setSelected((prev) => {
        const next = prev.includes(tag)
          ? prev.filter((t) => t !== tag)
          : [...prev, tag];
        onChange(next.join(" "));
        return next;
      });
    },
    [onChange],
  );

  const clear = () => {
    setSelected([]);
    onChange("");
  };

  // Filter by search input
  const allTags = [...new Set([...categories, ...productTags])];
  const visible = search.trim()
    ? allTags.filter((t) => t.toLowerCase().includes(search.toLowerCase()))
    : allTags;

  return (
    <div className="md:col-span-2">
      <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
        Slide Promotion — Pick what products to show
      </label>
      <p className="text-theme-tiny text-gray-400 mb-3">
        Click tags below to build the search query. Customers clicking the slide
        button will see matching products.
      </p>

      {/* Search filter */}
      <input
        type="text"
        placeholder={UiText.FILTER_TAGS}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-theme-caption mb-3 focus:outline-none focus:border-purple-400"
      />

      {/* Tag cloud */}
      {fetching ? (
        <div className="flex items-center gap-2 text-theme-caption text-gray-400 py-3">
          <span className="animate-spin border-2 border-purple-400 border-t-transparent rounded-full w-4 h-4 inline-block" />
          {UiText.LOADING_PRODUCTS}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-theme-caption text-gray-400 py-2">
          {UiText.NO_MATCHING_TAGS}
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {visible.map((tag) => {
            const active = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`px-3 py-1 rounded-full text-theme-xxs font-semibold border transition-all duration-150 ${
                  active
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700"
                }`}
              >
                {active ? "✓ " : ""}
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected summary */}
      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        {selected.length === 0 ? (
          <p className="text-theme-caption text-gray-400">
            {UiText.NO_TAGS_SELECTED}
          </p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-theme-tiny font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {UiText.SELECTED} ({selected.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {selected.map((t) => (
                    <span
                      key={t}
                      className="bg-purple-100 text-purple-700 text-theme-tiny font-bold px-2 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={clear}
                className="text-theme-tiny text-red-400 hover:text-red-600 font-semibold mt-0.5 flex-shrink-0"
              >
                {UiText.CLEAR_ALL}
              </button>
            </div>
            <p className="text-theme-tiny text-emerald-600 mt-2 font-mono">
              ↳ /store?search={encodeURIComponent(selected.join(" "))}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
