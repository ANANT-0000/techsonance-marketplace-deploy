export const getCompanyDomain = async () => {
    // Check if we are on the server
    if (typeof window === 'undefined') {
        const { headers } = await import('next/headers');
        const headersList = await headers();
        return headersList.get('host')?.split(':')[0] || null;
    }

    // If we are in the browser
    return window.location.hostname;
};