export function CmsSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
        <h3 className="text-theme-body-sm font-bold text-gray-900 uppercase tracking-wide">
          {title}
        </h3>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
