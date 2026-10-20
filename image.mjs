const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export function imageContentType(bytes) {
    if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v))
        return 'image/png';
    if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
        return 'image/jpeg';
    if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP')
        return 'image/webp';
    return '';
}
export async function readLimitedBody(body, max = MAX_IMAGE_BYTES) {
    if (!body)
        throw Error('Fichier vide.');
    const reader = body.getReader();
    let total = 0;
    const parts = [];
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done)
                break;
            total += value.length;
            if (total > max)
                throw Error('La photo doit faire moins de 5 Mo.');
            parts.push(value);
        }
    }
    finally {
        await reader.cancel();
    }
    const result = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
        result.set(part, offset);
        offset += part.length;
    }
    return result;
}
