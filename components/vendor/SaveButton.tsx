'use client';

import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
export function SaveButton({ isPending, saved }: { isPending: boolean; saved: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={isPending}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
      {isPending ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
    </motion.button>
  );
}