import { fetchCompanyCompliance } from "@/utils/vendorApiClient";
import { useEffect, useState, useTransition } from "react";

export function ComplianceTab({ token }: { token: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [addingField, setAddingField] = useState<{ key: string; label: string; placeholder: string } | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRecords = () => {
    fetchCompanyCompliance(token).then((res) => setRecords(res?.data || []));
  };

  useEffect(() => { loadRecords(); }, [token]);

  // const countryFields = COUNTRIES.find(c => c.country_code === selectedCountry)?.fields || [];
  // const existingByKey = records.reduce((acc, r) => {
  //   acc[`${r.country_code}__${r.field_key}`] = r;
  //   return acc;
  // }, {} as Record<string, any>);

  // const handleSave = () => {
  //   if (!addingField || !fieldValue.trim()) return;
  //   startTransition(async () => {
  //     await upsertCompanyComplianceField({
  //       country_code: selectedCountry,
  //       field_key: addingField.key,
  //       field_value: fieldValue.trim(),
  //       is_active: true,
  //       valid_until: validUntil || null,
  //     }, token);
  //     setAddingField(null);
  //     setFieldValue('');
  //     setValidUntil('');
  //     loadRecords();
  //   });
  // };

 

  return (
    <div className="space-y-6">
      {/* Country selector */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-900 rounded-full" />
          Country Registration Fields
        </h3>
        {/* <Field label="Select Country">
          <Select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="max-w-xs">
            {COUNTRIES.map(c => (
              <option key={c.country_code} value={c.country_code}>
                {c.country_name} ({c.country_code})
              </option>
            ))}
          </Select>
        </Field> */}
      </section>

      {/* Fields for selected country */}
      {/* {countryFields.length > 0 ? (
        <div className="space-y-3">
          {countryFields.map((field) => {
            const existing = existingByKey[`${selectedCountry}__${field.value}`];
            const isEditing = addingField?.key === field.value;

            return (
              <div
                key={field.value}
                className={`p-4 rounded-xl border transition-all ${existing ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{field.label}</span>
                      {field.required && <span className="text-[10px] font-bold text-red-500 px-1.5 py-0.5 bg-red-50 rounded-full">Required</span>}
                      {existing?.is_active === false && (
                        <span className="text-[10px] font-bold text-amber-600 px-1.5 py-0.5 bg-amber-50 rounded-full">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{field.helperText}</p>
                    {existing && !isEditing && (
                      <div className="mt-2 flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">{existing.field_value}</code>
                        {existing.valid_until && (
                          <span className="text-xs text-gray-400">Valid until {existing.valid_until}</span>
                        )}
                      </div>
                    )}
 
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 flex flex-col gap-2"
                      >
                        <Input
                          value={fieldValue}
                          onChange={(e) => setFieldValue(e.target.value)}
                          placeholder={field.placeholder}
                          autoFocus
                          className="font-mono max-w-sm"
                        />
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">Valid until (optional)</label>
                          <input
                            type="date"
                            value={validUntil}
                            onChange={(e) => setValidUntil(e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={handleSave}
                            disabled={isPending || !fieldValue.trim()}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg disabled:opacity-40"
                          >
                            {isPending ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                            Save
                          </button>
                          <button
                            onClick={() => { setAddingField(null); setFieldValue(''); }}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
 
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setAddingField({ key: field.value, label: field.label, placeholder: field.placeholder });
                        setFieldValue(existing?.field_value || '');
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title={existing ? 'Edit' : 'Add'}
                    >
                      {existing ? <Pen size={14} /> : <Plus size={14} />}
                    </button>
                    {existing && (
                      <button
                        onClick={() => handleDelete(existing.id)}
                        disabled={deletingId === existing.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deletingId === existing.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center text-gray-400 text-sm">
          No compliance fields defined for {selectedCountry}
        </div>
      )} */}
    </div>
  );
}
