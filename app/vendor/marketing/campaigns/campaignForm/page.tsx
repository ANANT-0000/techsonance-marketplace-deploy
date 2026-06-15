import CampaignForm from "@/components/vendor/CampaignForm";
import { CAMPAIGN_FORM_TEXT } from "@/constants/vendorText";

export default function CreateCampaignPage() {
  return (
    <div className="w-full p-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-theme-h4 font-bold text-gray-900">
          {CAMPAIGN_FORM_TEXT.HEADER.CREATE}
        </h1>
        <p className="text-theme-body-sm text-gray-500 mt-1">
          {CAMPAIGN_FORM_TEXT.HEADER.CREATE_DESC}
        </p>
      </div>
      <CampaignForm />
    </div>
  );
}