self.onmessage = async function (e) {
    const { file, chunk, chunkIndex, totalChunks, apiUrl } = e.data;
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('filename', file.name);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            self.postMessage({ chunkIndex, success: true });
        } else {
            throw new Error(`Failed to upload chunk ${chunkIndex}`);
        }
    } catch (error) {
        self.postMessage({ chunkIndex, success: false, error: error.message });
    }
};
