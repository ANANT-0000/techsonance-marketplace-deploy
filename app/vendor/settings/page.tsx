"use client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CompanyProfile,
  VendorProfile,
} from "@/components/vendor/VendorProfile";
import { VendorProfileSkeleton } from "@/components/vendor/VendorProfileSkeleton";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { useEffect, useState } from "react";

const fetchVendorProfile = async (
  token: string,
): Promise<CompanyProfile | null> => {
  try {
    const res = await AxiosAPI.get("/v1/company/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data;
  } catch (error) {
    return null;
  }
};

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const token = authToken();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const data = await fetchVendorProfile(token!);

      setProfile(data);

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <VendorProfileSkeleton />;
  }

  return <VendorProfile data={profile} />;
}
