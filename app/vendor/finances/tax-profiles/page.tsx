"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import { ChevronDown, ChevronUp, Download, Layers, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TableRowSkeleton } from "@/components/common/skeletons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authToken } from "@/utils/authToken";
import { fetchTaxProfiles } from "@/utils/vendorApiClient";
import { TAX_PROFILES_TEXT } from "@/constants/vendorText";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";
import { DataLoadErrorCard } from "@/components/vendor/DataLoadErrorCard";

interface TaxProfileType {
  id: string;
  profile_type: string;
  tax_profile_description: string;
  is_default: boolean;
  created_at: string;
}

export default function TaxProfilesPage() {
  const companyId = getClientCompanyId();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("desc");
  const [profiles, setProfiles] = useState<TaxProfileType[]>([]);
  const [loading, setLoading] = useState(true);

  const taxProfileHeader = [
    TAX_PROFILES_TEXT.TABLE.HEADERS.PROFILE_TYPE,
    TAX_PROFILES_TEXT.TABLE.HEADERS.DESCRIPTION,
    TAX_PROFILES_TEXT.TABLE.HEADERS.STATUS,
    TAX_PROFILES_TEXT.TABLE.HEADERS.CREATED_DATE,
    TAX_PROFILES_TEXT.TABLE.HEADERS.ACTIONS,
  ];

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsOpen(false);
  };

  const token = authToken();
  const router = useRouter();

  useEffect(() => {
    if (!token || !companyId) return;

    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const res = await fetchTaxProfiles(sortBy, date, token, companyId);
        setProfiles(res.data || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [sortBy, date, token, companyId]);

  const handleRoute = (id: string | null) => {
    if (id) {
      router.push(`/vendor/finances/tax-profiles/${id}`);
    } else {
      router.push(`/vendor/finances/tax-profiles/new`);
    }
  };

  if (!token || !companyId) {
    return (
      <DataLoadErrorCard
        title={TAX_PROFILES_TEXT.ERRORS.SESSION_EXPIRED_TITLE}
        description={TAX_PROFILES_TEXT.ERRORS.SESSION_EXPIRED_DESC}
        tryAgainText={TAX_PROFILES_TEXT.ERRORS.GO_TO_LOGIN}
        onTryAgain={() => router.push(VEDNOR_LOGIN_PATH)}
      />
    );
  }
  return (
    <section className="w-full px-1">
      <header className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Layers size={22} className="text-blue-500" />
          <h1 className="text-theme-h4 font-bold text-gray-800">
            {TAX_PROFILES_TEXT.HEADER.TITLE}
          </h1>
          {profiles && profiles.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-theme-caption font-semibold px-2.5 py-1 rounded-full">
              {profiles.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 font-semibold text-theme-body-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-5 py-2.5 transition-colors shadow-sm">
            <Download size={16} /> {TAX_PROFILES_TEXT.HEADER.EXPORT}
          </button>
          <button
            onClick={() => handleRoute(null)}
            className="flex items-center gap-2 font-semibold text-theme-body-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm"
          >
            <Plus size={16} /> {TAX_PROFILES_TEXT.HEADER.NEW_PROFILE}
          </button>
        </div>
      </header>

      <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
        <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
          <img
            className="w-5 h-5 opacity-50 shrink-0"
            src={searchImgDark}
            alt="search icon"
          />
          <input
            type="text"
            className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
            placeholder={TAX_PROFILES_TEXT.FILTERS.SEARCH_PLACEHOLDER}
          />
        </span>

        <span className="flex flex-wrap gap-3 items-center">
          <select
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            name="sort_by"
          >
            <option value="desc">
              {TAX_PROFILES_TEXT.FILTERS.SORT_NEWEST}
            </option>
            <option value="asc">{TAX_PROFILES_TEXT.FILTERS.SORT_OLDEST}</option>
          </select>

          {isOpen ? (
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-theme-body-sm border border-blue-300 bg-blue-50 text-blue-600 rounded-xl px-3 py-2 font-medium transition-colors"
            >
              {date
                ? date.toDateString()
                : TAX_PROFILES_TEXT.FILTERS.SELECT_DATE}{" "}
              <ChevronUp size={16} />
            </button>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-theme-body-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
            >
              {date
                ? date.toDateString()
                : TAX_PROFILES_TEXT.FILTERS.SELECT_DATE}{" "}
              <ChevronDown size={16} />
            </button>
          )}

          {isOpen && (
            <div className="absolute right-4 top-full mt-2 z-20 shadow-lg rounded-xl overflow-hidden border border-gray-200">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="rounded-xl bg-white"
                captionLayout="dropdown"
              />
            </div>
          )}
        </span>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full table-auto min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="p-4 w-10">
                <input type="checkbox" className="rounded" />
              </th>
              {taxProfileHeader.map((header) => (
                <th
                  key={header}
                  className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <TableRowSkeleton columns={6} rows={5} />
            ) : profiles && profiles?.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-blue-50/80 text-blue-500 rounded-full flex items-center justify-center mb-5 shadow-sm">
                      <Layers size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[17px] font-bold text-gray-900 tracking-tight mb-2">{TAX_PROFILES_TEXT.TABLE.EMPTY_TITLE}</h3>
                    <p className="text-[15px] text-gray-500 max-w-sm mb-6 leading-relaxed">
                      {TAX_PROFILES_TEXT.TABLE.EMPTY_DESC}
                    </p>
                    <button
                      onClick={() => handleRoute(null)}
                      className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-6 py-2.5 rounded-full transition-colors cursor-pointer border border-blue-100"
                    >
                      <Plus size={16} /> {TAX_PROFILES_TEXT.HEADER.NEW_PROFILE}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              profiles &&
              profiles?.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-gray-800 flex items-center gap-2">
                      {item.profile_type}
                      {item.is_default && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-theme-tiny tracking-wide font-bold">
                          {TAX_PROFILES_TEXT.TABLE.DEFAULT_BADGE}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-theme-body-sm">
                    {item.tax_profile_description}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
                      {TAX_PROFILES_TEXT.TABLE.STATUS_ACTIVE}
                    </span>
                  </td>
                  <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleRoute(item.id)}
                      className="text-theme-caption font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {TAX_PROFILES_TEXT.TABLE.ACTION_EDIT}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
