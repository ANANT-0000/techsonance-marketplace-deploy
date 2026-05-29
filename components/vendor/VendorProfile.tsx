export type CompanyProfile = {
  id: string;
  company_name: string;
  company_domain: string;
  company_structure: string;
  company_status: string;
  created_at: string;
  updated_at: string;

  vendor: {
    store_owner_first_name: string;
    store_owner_last_name: string;
    store_name: string;
    store_description: string;
    category: string;
    vendor_status: string;
    is_verified: boolean;
  };

  companyBranding: {
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
  };
};
function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: 'green' | 'amber' | 'slate';
}) {
  const styles = {
    green:
      'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber:
      'bg-amber-50 text-amber-700 border-amber-100',
    slate:
      'bg-slate-50 text-slate-700 border-slate-100',
  };

  return (
    <span
      className={`px-4 py-2 rounded-full border text-sm font-medium capitalize ${styles[color]}`}
    >
      {children}
    </span>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-[28px] bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <p className="text-sm uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-4 text-lg font-semibold text-slate-900 capitalize break-all">
        {value || '-'}
      </p>
    </div>
  );
}
export function VendorProfile({
  data,
}: {
  data: CompanyProfile | null;
}) {
  const profile = data;

  return (
    <main className="w-full p-6 lg:p-8 bg-gradient-to-b  min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)] border border-white/70">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background: `linear-gradient(135deg,
              ${profile?.companyBranding?.primary_color},
              ${profile?.companyBranding?.secondary_color})`,
          }}
        />

        <div className="relative z-10 p-8 lg:p-10 flex flex-col lg:flex-row justify-between gap-8">
          {/* left */}
          <div className="flex gap-6 items-start">
            <div className="w-24 h-24 rounded-3xl bg-white shadow-xl border border-slate-100 flex items-center justify-center p-3">
              {profile?.companyBranding?.logo_url ? (
                <img
                  src={profile.companyBranding.logo_url}
                  alt="logo"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-2xl font-semibold text-slate-400">
                  {profile?.company_name?.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm tracking-[0.2em] uppercase text-slate-400">
                Vendor Profile
              </p>

              <h1 className="text-3xl font-semibold text-slate-900 mt-2 capitalize">
                {profile?.vendor?.store_name}
              </h1>

              <p className="text-slate-500 mt-2 capitalize">
                {profile?.vendor?.category}
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <Badge color="green">
                  {profile?.vendor?.vendor_status}
                </Badge>

                <Badge color="amber">
                  {profile?.company_status}
                </Badge>

                <Badge color="slate">
                  {profile?.vendor?.is_verified
                    ? 'Verified'
                    : 'Unverified'}
                </Badge>
              </div>
            </div>
          </div>

          {/* branding */}
          <div className="flex gap-4 items-start">
            {[
              profile?.companyBranding?.primary_color,
              profile?.companyBranding?.secondary_color,
              profile?.companyBranding?.accent_color,
            ]
              .filter(Boolean)
              .map((color) => (
                <div key={color} className="text-center">
                  <div
                    className="w-12 h-12 rounded-2xl shadow-md border border-white"
                    style={{
                      backgroundColor: color,
                    }}
                  />

                  <p className="text-[11px] mt-2 text-slate-500">
                    {color}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* content */}
      <section className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 rounded-[28px] bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          <p className="text-sm uppercase tracking-widest text-slate-400">
            About Store
          </p>

          <h2 className="text-xl font-semibold mt-3 text-slate-900">
            {profile?.company_name}
          </h2>

          <p className="mt-5 leading-8 text-slate-600">
            {profile?.vendor?.store_description ||
              'No store description added yet.'}
          </p>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          <p className="text-sm uppercase tracking-widest text-slate-400">
            Owner
          </p>

          <h3 className="text-xl font-semibold mt-4 text-slate-900 capitalize">
            {profile?.vendor?.store_owner_first_name}{' '}
            {profile?.vendor?.store_owner_last_name}
          </h3>

          <p className="text-slate-500 mt-2">
            Business owner
          </p>
        </div>

        <InfoCard
          label="Company Domain"
          value={profile?.company_domain}
        />

        <InfoCard
          label="Structure"
          value={profile?.company_structure}
        />

        <InfoCard
          label="Font Family"
          value={profile?.companyBranding?.font_family}
        />
      </section>

      <section className="mt-8 rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col lg:flex-row justify-between text-sm text-slate-500">
        <p>
          Created:{' '}
          {profile?.created_at
            ? new Date(
                profile.created_at
              ).toLocaleDateString()
            : '-'}
        </p>

        <p>
          Updated:{' '}
          {profile?.updated_at
            ? new Date(
                profile.updated_at
              ).toLocaleDateString()
            : '-'}
        </p>
      </section>
    </main>
  );
}