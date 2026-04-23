import { companyDomain } from '@/config';

export const getCompanyDomain = async (): Promise<string> => {
    const isDev = process.env.NODE_ENV === 'development';
    const isProd = process.env.NODE_ENV === 'production';
    // Check if we are on the server
    if (typeof window === 'undefined') {
        const { headers } = await import('next/headers');
        const headersList = await headers();
        return headersList.get('host')?.split(':')[0] || isDev ? companyDomain : '';
    }

    // If we are in the browser
    return isDev ? companyDomain : window.location.hostname;
};