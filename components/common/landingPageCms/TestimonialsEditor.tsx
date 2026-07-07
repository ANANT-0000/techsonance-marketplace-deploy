"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import type { LandingTestimonialsContent } from "@/utils/Types";
import { useUndoableRemoval, UndoBanner } from "@/hooks/useUndoableRemoval";

interface TestimonialsEditorProps {
  value: LandingTestimonialsContent;
  onChange: (value: LandingTestimonialsContent) => void;
}

export function TestimonialsEditor({
  value,
  onChange,
}: TestimonialsEditorProps) {
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const setHeader = (patch: Partial<LandingTestimonialsContent["header"]>) =>
    onChange({ ...value, header: { ...value.header, ...patch } });

  const updateReview = (
    i: number,
    patch: Partial<LandingTestimonialsContent["reviews"][number]>,
  ) => {
    const updated = [...value.reviews];
    updated[i] = { ...updated[i], ...patch };
    onChange({ ...value, reviews: updated });
  };

  const addReview = () => {
    onChange({
      ...value,
      reviews: [
        ...value.reviews,
        {
          id: `review-${Date.now()}`,
          quote: "This platform changed my business.",
          author: "New User",
          role: "Owner - Company",
          avatar: "NU",
          isTall: false,
        },
      ],
    });
  };

  const removeReview = (i: number) => {
    const removed = value.reviews[i];
    const reviews = value.reviews.filter((_, idx) => idx !== i);
    onChange({ ...value, reviews });
    schedule({
      label: `Removed review from "${removed.author}"`,
      undo: () => {
        const restored = [...reviews];
        restored.splice(i, 0, removed);
        onChange({ ...value, reviews: restored });
      },
    });
  };

  return (
    <div className="space-y-6">
      <UndoBanner pending={pending} onUndo={runUndo} />

      {/* Section Header */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Testimonials Header</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="grid gap-1.5">
            <Label>Title Part 2</Label>
            <Input
              value={value.header.titlePart2 ?? ""}
              onChange={(e) => setHeader({ titlePart2: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Subtitle</Label>
          <Textarea
            value={value.header.subtitle}
            onChange={(e) => setHeader({ subtitle: e.target.value })}
            rows={2}
            className="resize-none"
          />
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-semibold text-base font-medium">
            Customer Stories
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addReview}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Review
          </Button>
        </div>
        {value.reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No reviews yet. Add one to start building social proof.
          </div>
        ) : (
          value.reviews.map((review, i) => (
            <div
              key={review.id}
              className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  Reviewer #{i + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove review from ${review.author}`}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeReview(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Quote Text
                </Label>
                <Textarea
                  value={review.quote}
                  onChange={(e) => updateReview(i, { quote: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Author Name
                  </Label>
                  <Input
                    value={review.author}
                    onChange={(e) =>
                      updateReview(i, { author: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Role / Company
                  </Label>
                  <Input
                    value={review.role}
                    onChange={(e) => updateReview(i, { role: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Avatar Initials
                  </Label>
                  <Input
                    value={review.avatar}
                    onChange={(e) =>
                      updateReview(i, { avatar: e.target.value })
                    }
                    maxLength={3}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id={`review-tall-${review.id}`}
                  checked={review.isTall ?? false}
                  onChange={(e) =>
                    updateReview(i, { isTall: e.target.checked })
                  }
                  className="rounded h-4 w-4 text-primary focus:ring-primary border-muted"
                />
                <Label
                  htmlFor={`review-tall-${review.id}`}
                  className="text-xs font-medium cursor-pointer text-muted-foreground"
                >
                  Tall Card Layout (spans extra height in masonry grid layout)
                </Label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
