"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Search, Tag, Calendar, Activity } from "lucide-react";

 
import { Button } from "@/components/ui/button";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import AxiosAPI from "@/lib/axios";


interface Campaign {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DRAFT";
  discount_config: { type: string; value: number };
  valid_from: string;
  valid_to: string;
  total_used: number;
}

export default function CampaignsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, [vendorId]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      // Adjust endpoint based on your unified promotions controller
      const res = await AxiosAPI.get(`/v1/promotions/company/${vendorId}`);
      setCampaigns(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 light:text-white">Campaigns & Offers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your marketing promotions, discounts, and custom offers.</p>
        </div>
        <Button
          onClick={() => router.push(`/vendor/${vendorId}/marketing/campaigns/campaignForm`)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Create Campaign
        </Button>
      </div>

      <div className="bg-white light:bg-gray-800 rounded-lg shadow-sm border border-gray-100 light:border-gray-700 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border rounded-md light:bg-gray-900 light:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoaderSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white light:bg-gray-800 rounded-xl shadow-sm border border-gray-100 light:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/vendor/${vendorId}/marketing/campaigns/campaignForm/${campaign.id}`)}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 light:bg-blue-900/30 rounded-lg text-blue-600 light:text-blue-400">
                  <Tag size={20} />
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  campaign.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {campaign.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 light:text-white mb-1">{campaign.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{campaign.description}</p>
              
              <div className="space-y-2 border-t border-gray-100 light:border-gray-700 pt-4">
                <div className="flex items-center text-sm text-gray-600 light:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  <span>{new Date(campaign.valid_from).toLocaleDateString()} - {new Date(campaign.valid_to).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 light:text-gray-400">
                  <Activity size={16} className="mr-2" />
                  <span>{campaign.total_used} redemptions</span>
                </div>
              </div>
            </div>
          ))}
          {filteredCampaigns.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No campaigns found. Create one to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}