"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CampaignForm, { ExistingPromotion } from "@/components/vendor/CampaignForm";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { CAMPAIGN_FORM_TEXT } from "@/constants/vendorText";

export default function EditCampaignPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const token = authToken();
  const [data, setData] = useState<ExistingPromotion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AxiosAPI.get(`/v1/promotions/${campaignId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) return <div className="flex justify-center py-20"><LoaderSpinner /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-theme-h4 font-bold text-gray-900">
          {CAMPAIGN_FORM_TEXT.HEADER.EDIT}
        </h1>
        <p className="text-theme-body-sm text-gray-500 mt-1">
          {CAMPAIGN_FORM_TEXT.HEADER.EDIT_DESC}
        </p>
      </div>
      <CampaignForm existingData={data as ExistingPromotion} />
    </div>
  );
}