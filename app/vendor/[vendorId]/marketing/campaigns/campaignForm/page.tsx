import CampaignForm from "@/components/vendor/CampaignForm";

export default function CreateCampaignPage() {
  return (
    <div className="w-full p-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
        <p className="text-sm text-gray-500 mt-1">Define a promotion with discount logic, schedule, rules, and targets.</p>
      </div>
      <CampaignForm />
    </div>
  );
}