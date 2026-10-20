import { parseHTML } from 'linkedom';
export class ProductLookupError extends Error {
}
export function normalizePrice(raw) {
    if (typeof raw !== 'string' && typeof raw !== 'number')
        return '';
    let value = String(raw).trim().replace(/[^0-9.,]/g, '');
    if (!value)
        return '';
    const comma = value.lastIndexOf(','), dot = value.lastIndexOf('.');
    if (comma >= 0 && dot >= 0) {
        const decimal = Math.max(comma, dot);
        value = value.slice(0, decimal).replace(/[.,]/g, '') + '.' + value.slice(decimal + 1);
    }
    else if (comma >= 0)
        value = value.replace(/\./g, '').replace(',', '.');
    else if ((value.match(/\./g) || []).length > 1) {
        const parts = value.split('.');
        value = parts.slice(0, -1).join('') + '.' + parts.at(-1);
    }
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 9999999.99 ? n.toFixed(2) : '';
}
export function parseProduct(html, pageUrl) {
    const { document } = parseHTML(html);
    const meta = (selector) => document.querySelector(selector)?.getAttribute('content')?.trim() || '';
    let product = null, visits = 0;
    function visit(value) {
        if (++visits > 3000 || !value || typeof value !== 'object' || product)
            return;
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }
        const node = value, types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
        if (types.some(t => typeof t === 'string' && /(^|\/)Product$/.test(t))) {
            product = node;
            return;
        }
        for (const child of Object.values(node))
            visit(child);
    }
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
            visit(JSON.parse(script.textContent || ''));
        }
        catch { /* Invalid store metadata is optional. */ }
    }
    const p = product;
    const offers = p?.offers, offer = (Array.isArray(offers) ? offers[0] : offers);
    const amount = normalizePrice(offer?.price ?? offer?.lowPrice ?? offer?.priceSpecification?.price)
        || normalizePrice(meta('meta[property="product:price:amount"]') || meta('meta[property="og:price:amount"]') || meta('meta[itemprop="price"]'))
        || normalizePrice(document.querySelector('#corePrice_feature_div .a-price .a-offscreen, #corePriceDisplay_desktop_feature_div .a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice, [itemprop="price"]')?.textContent || '');
    let currency = String(offer?.priceCurrency ?? offer?.priceSpecification?.priceCurrency ?? '').toUpperCase()
        || meta('meta[property="product:price:currency"]') || meta('meta[property="og:price:currency"]') || meta('meta[itemprop="priceCurrency"]');
    currency = currency.toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency))
        currency = '';
    const title = String(p?.name || document.querySelector('#productTitle')?.textContent?.trim() || meta('meta[property="og:title"]') || document.querySelector('h1')?.textContent?.trim() || document.querySelector('title')?.textContent?.trim() || '').replace(/\s+/g, ' ').trim().slice(0, 160);
    if (!title || /robot check|captcha|access denied|accès refusé|just a moment|attention required|service unavailable/i.test(title))
        throw new ProductLookupError('La boutique bloque la récupération. Vous pouvez renseigner le nom et le prix manuellement.');
    let url = new URL(pageUrl);
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    if (canonical) {
        try {
            const candidate = new URL(canonical, pageUrl);
            if (candidate.origin === url.origin && !candidate.username && !candidate.password)
                url = candidate;
        }
        catch { }
    }
    url.hash = '';
    let imageUrl = '';
    const imageData = p?.image;
    const firstImage = Array.isArray(imageData) ? imageData[0] : imageData;
    const rawImage = typeof firstImage === 'string' ? firstImage : firstImage && typeof firstImage === 'object' ? String(firstImage.url || firstImage.contentUrl || '') : meta('meta[property="og:image"]') || meta('meta[name="twitter:image"]');
    if (rawImage) {
        try {
            imageUrl = validatePublicUrl(new URL(rawImage, pageUrl).href).href;
        }
        catch { }
    }
    return { title, price: amount, currency, url: url.href, imageUrl, warning: !amount ? 'Le prix n’est pas disponible sur cette page. Vous pouvez le saisir manuellement.' : !currency ? 'Prix trouvé : vérifiez la devise avant d’enregistrer.' : '' };
}
export function validatePublicUrl(raw) {
    let url;
    try {
        url = new URL(raw);
    }
    catch {
        throw new ProductLookupError('Indiquez un lien web complet.');
    }
    const host = url.hostname.toLowerCase();
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80', '443'].includes(url.port)) || host.length > 253 || !host.includes('.') || !/^[a-z0-9.-]+$/.test(host) || /^[\d.]+$/.test(host) || /(^|\.)(localhost|local|internal|lan|test|invalid|onion|home|arpa)$/.test(host))
        throw new ProductLookupError('Utilisez le lien public d’une boutique en ligne.');
    url.hash = '';
    return url;
}
export function isPublicAddress(address) {
    if (address.includes(':')) {
        const ip = address.toLowerCase();
        // Only global-unicast IPv6, excluding documentation and transition ranges.
        return /^[23][0-9a-f]{0,3}:/.test(ip) && !ip.startsWith('2001:db8:') && !ip.startsWith('2001:0:') && !ip.startsWith('2002:');
    }
    const bytes = address.split('.').map(Number);
    if (bytes.length !== 4 || bytes.some(v => !Number.isInteger(v) || v < 0 || v > 255))
        return false;
    const [a, b] = bytes;
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 168 || b === 0) || a === 100 && b >= 64 && b <= 127 || a === 198 && (b === 18 || b === 19 || b === 51) || a === 203 && b === 0);
}
export async function assertPublicDns(hostname, signal) {
    const responses = await Promise.all(['A', 'AAAA'].map(async (type) => {
        const r = await fetch('https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(hostname) + '&type=' + type, { headers: { Accept: 'application/dns-json' }, signal, redirect: 'manual' });
        if (!r.ok)
            throw new ProductLookupError('La boutique ne répond pas. Réessayez ou saisissez les informations manuellement.');
        return await r.json();
    }));
    const addresses = responses.flatMap(r => r.Answer || []).filter(a => a.type === 1 || a.type === 28);
    if (!addresses.length || addresses.some(a => !isPublicAddress(a.data)))
        throw new ProductLookupError('Le lien ne correspond pas à une boutique publique accessible.');
}
export async function fetchProduct(raw) {
    let url = validatePublicUrl(raw);
    const signal = AbortSignal.timeout(14000);
    for (let redirects = 0; redirects <= 4; redirects++) {
        await assertPublicDns(url.hostname, signal);
        const response = await fetch(url.href, { redirect: 'manual', signal, headers: { Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.6', 'User-Agent': 'Famille-ProductPreview/1.0' } });
        if ([301, 302, 303, 307, 308].includes(response.status)) {
            const location = response.headers.get('location');
            await response.body?.cancel();
            if (!location)
                throw new ProductLookupError('Le lien de la boutique est incomplet.');
            url = validatePublicUrl(new URL(location, url).href);
            continue;
        }
        if (!response.ok) {
            await response.body?.cancel();
            throw new ProductLookupError('La boutique ne permet pas la récupération de ce produit. Vous pouvez saisir les informations manuellement.');
        }
        if (!/text\/html|application\/xhtml\+xml/i.test(response.headers.get('content-type') || '')) {
            await response.body?.cancel();
            throw new ProductLookupError('Ce lien ne mène pas à une fiche produit.');
        }
        const reader = response.body?.getReader();
        if (!reader)
            throw new ProductLookupError('La page de la boutique est vide.');
        let total = 0;
        const parts = [];
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done)
                    break;
                total += value.length;
                if (total > 2_500_000)
                    throw new ProductLookupError('La fiche produit est trop volumineuse. Saisissez les informations manuellement.');
                parts.push(value);
            }
        }
        finally {
            await reader.cancel();
        }
        const bytes = new Uint8Array(total);
        let offset = 0;
        for (const part of parts) {
            bytes.set(part, offset);
            offset += part.length;
        }
        return parseProduct(new TextDecoder().decode(bytes), url.href);
    }
    throw new ProductLookupError('Le lien redirige trop souvent. Utilisez le lien direct du produit.');
}
