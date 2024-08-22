import { join } from 'path';
import { existsSync } from 'fs';

export function getUniqueFilename(uploadDir: string, filename: string): string {
    let uniqueFilename = filename;
    let filePath = join(uploadDir, uniqueFilename);
    let counter = 1;

    // 檢查目錄中是否存在相同名稱的文件，若存在則增加後綴
    while (existsSync(filePath)) {
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, ""); // 去掉擴展名
        const ext = filename.split('.').pop(); // 提取擴展名
        uniqueFilename = `${nameWithoutExt}(${counter++}).${ext}`;
        filePath = join(uploadDir, uniqueFilename);
    }

    return uniqueFilename;
}
