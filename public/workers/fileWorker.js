self.onmessage = async function (e) {
    const { file, chunk, chunkIndex, totalChunks, apiUrl } = e.data;
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('filename', file.name);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                self.postMessage({ chunkIndex, success: true });
                return;
            } else {
                throw new Error(`Failed to upload chunk ${chunkIndex}`);
            }
        } catch (error) {
            attempts += 1;
            if (attempts >= maxAttempts) {
                self.postMessage({ chunkIndex, success: false, error: error.message });
                return;
            }
        }
    }
};
