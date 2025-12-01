export async function fetchTaskImage(query: string): Promise<string | null> {
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (!pexelsApiKey) {
        console.warn('PEXELS_API_KEY is not set');
        return null;
    }

    try {
        const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
            headers: { Authorization: pexelsApiKey },
        });

        if (pexelsRes.ok) {
            const pexelsData = await pexelsRes.json();
            if (pexelsData.photos && pexelsData.photos.length > 0) {
                return pexelsData.photos[0].src.medium;
            }
        }
    } catch (error) {
        console.error('Error fetching image from Pexels:', error);
    }
    return null;
}
