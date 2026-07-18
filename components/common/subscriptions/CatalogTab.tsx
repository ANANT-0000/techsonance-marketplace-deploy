import React, { useEffect, useState, useCallback } from "react";
import { Layers, Loader2, Plus, Edit3, Trash2, Shield, Settings, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import AxiosAPI from "@/lib/axios";
import { SUBSCRIBATION_TEXT } from "@/constants/adminText";

// Value Type and Enforcement Mode types
type ValueType = "boolean" | "counter" | "rate" | "gauge";
type EnforcementMode = "hard" | "soft";

export interface FeatureDefinition {
  id: string;
  feature_key: string;
  display_name: string;
  description: string | null;
  value_type: ValueType;
  enforcement_mode: EnforcementMode;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

enum CatalogUiState {
  IDLE = "IDLE",
  LOADING = "LOADING",
  ERROR = "ERROR",
}

interface CatalogTabProps {
  token: string | null;
}

export default function CatalogTab({ token }: CatalogTabProps) {
  const [definitions, setDefinitions] = useState<FeatureDefinition[]>([]);
  const [uiState, setUiState] = useState<CatalogUiState>(CatalogUiState.IDLE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit/Create state
  const [editingDefinition, setEditingDefinition] = useState<FeatureDefinition | null>(null);
  const [featureKey, setFeatureKey] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [valueType, setValueType] = useState<ValueType>("boolean");
  const [enforcementMode, setEnforcementMode] = useState<EnforcementMode>("hard");
  const [isActive, setIsActive] = useState(true);

  // Load feature definitions from API
  const loadDefinitions = useCallback(async () => {
    if (!token) return;
    setUiState(CatalogUiState.LOADING);
    try {
      const res = await AxiosAPI.get("/v1/admin/subscription-plans/feature-definitions", {
        headers: {
          "x-suppress-redirect": "true",
        },
      });
      setDefinitions(Array.isArray(res.data?.data) ? res.data.data : []);
      setUiState(CatalogUiState.IDLE);
    } catch (err) {
      setUiState(CatalogUiState.ERROR);
      toast.error(SUBSCRIBATION_TEXT.CATALOG.FETCH_ERROR);
    }
  }, [token]);

  useEffect(() => {
    loadDefinitions();
  }, [loadDefinitions]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingDefinition(null);
    setFeatureKey("");
    setDisplayName("");
    setDescription("");
    setValueType("boolean");
    setEnforcementMode("hard");
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (def: FeatureDefinition) => {
    setEditingDefinition(def);
    setFeatureKey(def.feature_key);
    setDisplayName(def.display_name);
    setDescription(def.description || "");
    setValueType(def.value_type);
    setEnforcementMode(def.enforcement_mode);
    setIsActive(def.is_active);
    setIsModalOpen(true);
  };

  // Submit create or edit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!displayName.trim() || !featureKey.trim()) {
      toast.error("Please fill out feature key and display name.");
      return;
    }

    setIsSaving(true);

    const payload = {
      feature_key: featureKey,
      display_name: displayName,
      description: description.trim() || null,
      value_type: valueType,
      enforcement_mode: enforcementMode,
      is_active: isActive,
    };

    try {
      if (editingDefinition) {
        // Edit flow
        await AxiosAPI.put(
          `/v1/admin/subscription-plans/feature-definitions/${editingDefinition.id}`,
          payload,
          {
            headers: {
              "x-suppress-redirect": "true",
            },
          }
        );
        toast.success(SUBSCRIBATION_TEXT.CATALOG.SUCCESS_UPDATE);
      } else {
        // Create flow
        await AxiosAPI.post(
          "/v1/admin/subscription-plans/feature-definitions",
          payload,
          {
            headers: {
              "x-suppress-redirect": "true",
            },
          }
        );
        toast.success(SUBSCRIBATION_TEXT.CATALOG.SUCCESS_CREATE);
      }
      setIsModalOpen(false);
      loadDefinitions();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          (editingDefinition
            ? SUBSCRIBATION_TEXT.CATALOG.FAILED_UPDATE
            : SUBSCRIBATION_TEXT.CATALOG.FAILED_CREATE)
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a feature definition
  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`${SUBSCRIBATION_TEXT.CATALOG.CONFIRM_DELETE}\nFeature: "${key}"`)) {
      return;
    }

    try {
      await AxiosAPI.delete(`/v1/admin/subscription-plans/feature-definitions/${id}`, {
        headers: {
          "x-suppress-redirect": "true",
        },
      });
      toast.success(SUBSCRIBATION_TEXT.CATALOG.SUCCESS_DELETE);
      loadDefinitions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || SUBSCRIBATION_TEXT.CATALOG.FAILED_DELETE);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="mb-10 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-500" />
            {SUBSCRIBATION_TEXT.CATALOG.TITLE}
          </h2>
          <p className="text-xs text-slate-500">
            {SUBSCRIBATION_TEXT.CATALOG.SUBTITLE}
          </p>
        </div>
        <Button
          type="button"
          onClick={handleOpenCreate}
          className="h-9 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {SUBSCRIBATION_TEXT.CATALOG.ADD_BTN}
        </Button>
      </div>

      {/* Main UI Body States */}
      {uiState === CatalogUiState.LOADING ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <p className="text-sm text-slate-400">Loading catalog definitions…</p>
        </div>
      ) : uiState === CatalogUiState.ERROR ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <p className="text-sm text-red-500">Failed to load feature definitions.</p>
          <Button variant="outline" size="sm" onClick={loadDefinitions} className="text-xs">
            Retry
          </Button>
        </div>
      ) : definitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Layers className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No feature definitions</p>
          <p className="text-xs text-slate-400 text-center max-w-sm">
            Create global catalog feature definitions to make them configurable on plan limit quota rules.
          </p>
          <Button type="button" onClick={handleOpenCreate} size="sm" className="mt-2 text-xs">
            Create First Feature
          </Button>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full table-auto min-w-[800px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="p-3.5">{SUBSCRIBATION_TEXT.CATALOG.TABLE_HEADERS.KEY}</th>
                <th className="p-3.5">{SUBSCRIBATION_TEXT.CATALOG.TABLE_HEADERS.DISPLAY_NAME}</th>
                <th className="p-3.5">{SUBSCRIBATION_TEXT.CATALOG.TABLE_HEADERS.VALUE_TYPE}</th>
                <th className="p-3.5">{SUBSCRIBATION_TEXT.CATALOG.TABLE_HEADERS.ENFORCEMENT}</th>
                <th className="p-3.5">{SUBSCRIBATION_TEXT.CATALOG.TABLE_HEADERS.STATUS}</th>
                <th className="p-3.5 text-center">{SUBSCRIBATION_TEXT.CATALOG.TABLE_HEADERS.ACTIONS}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {definitions.map((def) => (
                <tr key={def.id} className="hover:bg-slate-50 transition-colors">
                  {/* Feature Key */}
                  <td className="p-3.5 font-mono font-semibold text-slate-800">
                    {def.feature_key}
                  </td>

                  {/* Display Name & Description */}
                  <td className="p-3.5">
                    <div>
                      <p className="font-semibold text-slate-800">{def.display_name}</p>
                      {def.description && (
                        <p className="text-[10px] text-slate-450 mt-0.5 line-clamp-1">
                          {def.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Value Type */}
                  <td className="p-3.5">
                    <Badge
                      variant="outline"
                      className={`capitalize text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        def.value_type === "boolean"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : def.value_type === "counter"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : def.value_type === "rate"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-teal-50 text-teal-700 border-teal-100"
                      }`}
                    >
                      {def.value_type}
                    </Badge>
                  </td>

                  {/* Enforcement Mode */}
                  <td className="p-3.5">
                    <Badge
                      variant="outline"
                      className={`capitalize text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        def.enforcement_mode === "hard"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {def.enforcement_mode}
                    </Badge>
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    {def.is_active ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 w-fit">
                        <Check className="h-3 w-3 shrink-0" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 w-fit">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => handleOpenEdit(def)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 border-slate-200 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => handleDelete(def.id, def.feature_key)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 border-slate-200 hover:border-red-100 rounded-lg transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE/EDIT FEATURE DEFINITION DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-md border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader className="border-b border-slate-100 pb-3 mb-4">
              <DialogTitle className="text-base font-bold text-slate-900">
                {editingDefinition
                  ? SUBSCRIBATION_TEXT.CATALOG.MODAL_EDIT_TITLE
                  : SUBSCRIBATION_TEXT.CATALOG.MODAL_CREATE_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure features catalog keys that can be checked in system checkpoints.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 text-slate-800">
              {/* Feature Key */}
              <div>
                <Label htmlFor="feature_key" className="text-xs font-semibold block mb-1">
                  {SUBSCRIBATION_TEXT.CATALOG.LABEL_KEY}
                </Label>
                <Input
                  id="feature_key"
                  value={featureKey}
                  onChange={(e) => setFeatureKey(e.target.value)}
                  disabled={editingDefinition !== null}
                  placeholder={SUBSCRIBATION_TEXT.CATALOG.PLACEHOLDER_KEY}
                  className="text-xs h-9 font-mono rounded-lg border-slate-200"
                />
              </div>

              {/* Display Name */}
              <div>
                <Label htmlFor="display_name" className="text-xs font-semibold block mb-1">
                  {SUBSCRIBATION_TEXT.CATALOG.LABEL_DISPLAY}
                </Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={SUBSCRIBATION_TEXT.CATALOG.PLACEHOLDER_DISPLAY}
                  className="text-xs h-9 rounded-lg border-slate-200"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-xs font-semibold block mb-1">
                  {SUBSCRIBATION_TEXT.CATALOG.LABEL_DESC}
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={SUBSCRIBATION_TEXT.CATALOG.PLACEHOLDER_DESC}
                  className="text-xs h-9 rounded-lg border-slate-200"
                />
              </div>

              {/* Grid for Value Type & Enforcement Mode */}
              <div className="grid grid-cols-2 gap-3">
                {/* Value Type */}
                <div>
                  <Label htmlFor="value_type" className="text-xs font-semibold block mb-1">
                    {SUBSCRIBATION_TEXT.CATALOG.LABEL_VALUE_TYPE}
                  </Label>
                  <Select
                    value={valueType}
                    onValueChange={(v) => setValueType(v as ValueType)}
                  >
                    <SelectTrigger id="value_type" className="text-xs h-9 rounded-lg border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boolean" className="text-xs">Boolean (Toggle)</SelectItem>
                      <SelectItem value="counter" className="text-xs">Counter (Accumulative)</SelectItem>
                      <SelectItem value="rate" className="text-xs">Rate (Interval Resets)</SelectItem>
                      <SelectItem value="gauge" className="text-xs">Gauge (Current Val)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Enforcement Mode */}
                <div>
                  <Label htmlFor="enforcement_mode" className="text-xs font-semibold block mb-1">
                    {SUBSCRIBATION_TEXT.CATALOG.LABEL_ENFORCEMENT}
                  </Label>
                  <Select
                    value={enforcementMode}
                    onValueChange={(v) => setEnforcementMode(v as EnforcementMode)}
                  >
                    <SelectTrigger id="enforcement_mode" className="text-xs h-9 rounded-lg border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hard" className="text-xs">Hard (Hard Block)</SelectItem>
                      <SelectItem value="soft" className="text-xs">Soft (Observability Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Is Active */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-2">
                <div>
                  <span className="text-xs font-semibold block text-slate-800">
                    {SUBSCRIBATION_TEXT.CATALOG.LABEL_ACTIVE}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Deactivating feature blocks limit checks on this key.
                  </span>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 pt-3 mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs h-9 rounded-xl"
              >
                {SUBSCRIBATION_TEXT.CATALOG.CANCEL_BTN}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="text-xs h-9 rounded-xl bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5"
              >
                {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                {SUBSCRIBATION_TEXT.CATALOG.SAVE_BTN}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
