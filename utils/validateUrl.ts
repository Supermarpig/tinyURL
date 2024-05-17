export async function validateUrl(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        return response.ok;
    } catch (error) {
        console.error('Failed to validate URL', error);
        return false;
    }
}
