import CampaignForm from "@/components/vendor/CampaignForm";

 

export default function CreateCampaignPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Campaign</h1>
        <p className="text-sm text-gray-500 mt-1">Define offer rules, discount logic, and targeting strategies.</p>
      </div>
      <CampaignForm />
    </div>
  );
}