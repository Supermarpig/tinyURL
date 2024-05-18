export async function validateUrl(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
            method: 'GET', 
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        return response.ok;
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                console.error('Request timed out');
            } else {
                console.error('Failed to validate URL', error);
            }
        } else {
            console.error('An unexpected error occurred', error);
        }
        return false;
    }
}
