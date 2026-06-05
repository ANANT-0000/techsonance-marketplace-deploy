import AnalysisBoard from '@/components/vendor/AnalysisBoard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | Techsonance Marketplace',
  description: 'View your store performance, revenue, and order analytics.',
};

export default async function VendorAnalysisPage() {  
  return (
    <div className="flex-1 w-full h-full bg-muted/10">
      <AnalysisBoard  />
    </div>
  );
}