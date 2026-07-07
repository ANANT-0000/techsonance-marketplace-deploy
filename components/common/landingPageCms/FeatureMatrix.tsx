"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, GripVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeatureType } from "@/utils/Types";

export interface Feature {
  key: string;
  type: FeatureType;
  value: boolean | number | string;
}

interface FeatureMatrixProps {
  features: Feature[];
  onChange: (features: Feature[]) => void;
}

export function FeatureMatrix({ features, onChange }: FeatureMatrixProps) {
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState<FeatureType>(FeatureType.BOOLEAN);

  const handleUpdate = (index: number, field: keyof Feature, value: any) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    // If type changes, reset value to a default
    if (field === "type") {
      if (value === "boolean") updated[index].value = true;
      else if (value === "number") updated[index].value = 0;
      else updated[index].value = "";
    }
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAdd = () => {
    if (!newKey.trim()) return;
    const initialValue =
      newType === "boolean" ? true : newType === "number" ? 0 : "";
    onChange([
      ...features,
      { key: newKey.trim(), type: newType, value: initialValue },
    ]);
    setNewKey("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium w-8"></th>
              <th className="px-4 py-3 font-medium">Feature Key</th>
              <th className="px-4 py-3 font-medium w-32">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium w-16 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {features.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No features added yet.
                </td>
              </tr>
            ) : (
              features.map((feature, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 text-muted-foreground/50">
                    <GripVertical className="h-4 w-4 cursor-grab" />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={feature.key}
                      onChange={(e) => handleUpdate(i, "key", e.target.value)}
                      className="h-8"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={feature.type}
                      onValueChange={(val) =>
                        handleUpdate(i, "type", val as FeatureType)
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    {feature.type === "boolean" ? (
                      <Select
                        value={feature.value ? "true" : "false"}
                        onValueChange={(val) =>
                          handleUpdate(i, "value", val === "true")
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True (Included)</SelectItem>
                          <SelectItem value="false">
                            False (Excluded)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : feature.type === "number" ? (
                      <Input
                        type="number"
                        value={String(feature.value)}
                        onChange={(e) =>
                          handleUpdate(i, "value", parseFloat(e.target.value))
                        }
                        className="h-8"
                      />
                    ) : (
                      <Input
                        value={String(feature.value)}
                        onChange={(e) =>
                          handleUpdate(i, "value", e.target.value)
                        }
                        className="h-8"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border bg-muted/20">
        <div className="flex-1">
          <Input
            placeholder="New feature key (e.g. max_users)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-9"
          />
        </div>
        <div className="w-32">
          <Select
            value={newType}
            onValueChange={(val) => setNewType(val as FeatureType)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="text">Text</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAdd}
          size="sm"
          className="h-9 px-4 shrink-0"
          disabled={!newKey.trim()}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Feature
        </Button>
      </div>
    </div>
  );
}
