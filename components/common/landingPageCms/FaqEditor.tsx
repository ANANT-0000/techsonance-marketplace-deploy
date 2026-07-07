"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import type { LandingFaqContent } from "@/utils/Types";
import { useUndoableRemoval, UndoBanner } from "@/hooks/useUndoableRemoval";

interface FaqEditorProps {
  value: LandingFaqContent;
  onChange: (value: LandingFaqContent) => void;
}

export function FaqEditor({ value, onChange }: FaqEditorProps) {
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const setHeader = (patch: Partial<LandingFaqContent["header"]>) =>
    onChange({ ...value, header: { ...value.header, ...patch } });

  const updateQuestion = (
    i: number,
    patch: Partial<LandingFaqContent["questions"][number]>,
  ) => {
    const updated = [...value.questions];
    updated[i] = { ...updated[i], ...patch };
    onChange({ ...value, questions: updated });
  };

  const addQuestion = () => {
    onChange({
      ...value,
      questions: [
        ...value.questions,
        {
          id: `faq-${Date.now()}`,
          q: "New question?",
          a: "Your answer goes here.",
        },
      ],
    });
  };

  const removeQuestion = (i: number) => {
    const removed = value.questions[i];
    const questions = value.questions.filter((_, idx) => idx !== i);
    onChange({ ...value, questions });
    schedule({
      label: `Removed question "${removed.q}"`,
      undo: () => {
        const restored = [...questions];
        restored.splice(i, 0, removed);
        onChange({ ...value, questions: restored });
      },
    });
  };

  return (
    <div className="space-y-6">
      <UndoBanner pending={pending} onUndo={runUndo} />

      {/* Section Header */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">FAQ Section Header</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label>Section Label</Label>
            <Input
              value={value.header.label}
              onChange={(e) => setHeader({ label: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Part 1</Label>
            <Input
              value={value.header.titlePart1}
              onChange={(e) => setHeader({ titlePart1: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Highlight</Label>
            <Input
              value={value.header.titleHighlight}
              onChange={(e) => setHeader({ titleHighlight: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Subtitle / Support contact line</Label>
          <Textarea
            value={value.header.subtitle}
            onChange={(e) => setHeader({ subtitle: e.target.value })}
            rows={2}
            className="resize-none"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-semibold text-base">
            Frequently Asked Questions
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addQuestion}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Question
          </Button>
        </div>
        {value.questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No questions yet. Add one to start building the FAQ.
          </div>
        ) : (
          value.questions.map((item, i) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-1">
                  {i + 1}
                </span>
                <div className="flex-1 space-y-4">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Question text
                    </Label>
                    <Input
                      value={item.q}
                      onChange={(e) => updateQuestion(i, { q: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Answer text
                    </Label>
                    <Textarea
                      value={item.a}
                      onChange={(e) => updateQuestion(i, { a: e.target.value })}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove question ${i + 1}`}
                  className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                  onClick={() => removeQuestion(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
