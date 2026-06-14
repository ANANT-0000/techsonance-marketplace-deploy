import { UiText } from "@/constants/ui-text";
import { OrderStatus, OrderStatusEnum } from "@/utils/Types";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { STATUS_CONFIG } from "@/constants/ui-labels";

interface StatusEditorProps {
  status: OrderStatus;
  onSave: (s: OrderStatus) => Promise<void>;
  setOrderStatus?: React.Dispatch<React.SetStateAction<OrderStatus>>;
  setItemStatuses?: React.Dispatch<
    React.SetStateAction<Record<string, OrderStatus>>
  >;
  uiText?: {
    edit?: string;
    saving?: string;
    save?: string;
    cancel?: string;
    statusLabels?: Record<string, string>;
  };
}

export function StatusEditor({
  status,
  onSave,
  setOrderStatus,
  setItemStatuses,
  uiText,
}: StatusEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<OrderStatus>(status);
  const [saving, setSaving] = useState(false);

  const editLabel = uiText?.edit ?? UiText.ORDER_DETAILS.EDIT;
  const savingLabel = uiText?.saving ?? UiText.ORDER_DETAILS.SAVING;
  const saveLabel = uiText?.save ?? UiText.ORDER_DETAILS.SAVE;
  const cancelLabel = uiText?.cancel ?? UiText.ORDER_DETAILS.CANCEL;
  const statusLabels =
    uiText?.statusLabels ?? UiText.ORDER_DETAILS.STATUS_LABELS;

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    if (setOrderStatus) {
      setOrderStatus(draft);
    }
    if (setItemStatuses) {
      setItemStatuses((prev) => ({ ...prev, draft }));
    }
    setSaving(false);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        <button
          onClick={() => {
            setDraft(status);
            setEditing(true);
          }}
          className="inline-flex items-center gap-1 text-theme-caption text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Pencil size={11} /> {editLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <select
        value={draft}
        onChange={(e) => setDraft(e.target.value as OrderStatus)}
        className="text-theme-caption border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
      >
        {(Object.keys(STATUS_CONFIG) as OrderStatusEnum[]).map((s) => (
          <option key={s} value={s}>
            {
              statusLabels[
                s.toUpperCase() as keyof typeof UiText.ORDER_DETAILS.STATUS_LABELS
              ]
            }
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-theme-caption px-2.5 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60 transition-colors font-medium"
      >
        {saving ? savingLabel : saveLabel}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-theme-caption px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        {cancelLabel}
      </button>
    </div>
  );
}
