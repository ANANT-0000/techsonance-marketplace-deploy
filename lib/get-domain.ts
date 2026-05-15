import { companyDomain } from '@/config';
let cached: string | null = null;
export const getCompanyDomain = async (): Promise<string> => {
    const isDev = process.env.NODE_ENV === 'development';
    let rawHost = '';
  if (cached) return cached;
    if (typeof window === 'undefined') {
        const { headers } = await import('next/headers');
        const headersList = await headers();
        rawHost = headersList.get('host')?.split(':')[0] || '';
    } else {
        rawHost = window.location.hostname;
    }
    if (!rawHost) {
        return isDev ? companyDomain : '';
    }
    if (isDev && rawHost === 'localhost') {
        return companyDomain;
    }
    cached = rawHost;
  return cached;
};