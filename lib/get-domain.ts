import { companyDomain } from '@/config';

export const getCompanyDomain = async (): Promise<string> => {
    const isDev = process.env.NODE_ENV === 'development';
    let rawHost = '';

    // 1. Get the raw host based on the environment (Server vs Browser)
    if (typeof window === 'undefined') {
        const { headers } = await import('next/headers');
        const headersList = await headers();
        // Get host and strip the port (e.g., localhost:3000 -> localhost)
        rawHost = headersList.get('host')?.split(':')[0] || '';
    } else {
        rawHost = window.location.hostname;
    }

    // 2. If no host was found at all, fallback to dev config
    if (!rawHost) {
        return isDev ? companyDomain : '';
    }

    // 3. If we are running locally, bypass 'localhost' and return the config domain
    if (isDev && rawHost === 'localhost') {
        return companyDomain;
    }

    // 4. Extract the subdomain/company name
    // Transforms 'techsonance-marketplace-infotech-llp.vercel.app' -> 'techsonance-marketplace-infotech-llp'
    

    return rawHost
};