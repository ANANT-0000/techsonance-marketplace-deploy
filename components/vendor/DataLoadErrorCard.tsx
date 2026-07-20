import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface DataLoadErrorCardProps {
  title: string;
  description: string;
  onTryAgain?: () => void;
  showGoBack?: boolean;
  tryAgainText: string;
  goBackText?: string;
}

export function DataLoadErrorCard({
  title,
  description,
  onTryAgain,
  showGoBack = false,
  tryAgainText,
  goBackText,
}: DataLoadErrorCardProps) {
  const router = useRouter();

  return (
    <div className="w-full px-2 min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-red-100/50 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center p-16 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          {title}
        </h3>
        <p className="text-[15px] text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
          {description}
        </p>
        <div className="flex gap-4">
          {showGoBack && goBackText && (
            <button
              onClick={() => router.back()}
              className="bg-white text-slate-600 hover:text-slate-800 font-semibold px-6 py-2.5 rounded-full transition-colors border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              {goBackText}
            </button>
          )}
          {onTryAgain && (
            <button
              onClick={onTryAgain}
              className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-semibold px-6 py-2.5 rounded-full transition-colors border border-red-100 cursor-pointer"
            >
              {tryAgainText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
