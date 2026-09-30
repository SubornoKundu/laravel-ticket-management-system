export function formatDate(value: string | null | undefined): string {
    if (!value) return '';
    return new Date(value).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

// Defaults to BDT since that's the likely context — change currency/locale
// here if you need USD or another currency instead.
export function formatPrice(value: string | number): string {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 2,
    }).format(num);
}

/**
 * Reads the XSRF-TOKEN cookie for use with native fetch() calls.
 * axios isn't a dependency here, so this stands in for the header
 * axios would normally attach automatically.
 */
export function xsrfHeader(): Record<string, string> {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? { 'X-XSRF-TOKEN': decodeURIComponent(match[1]) } : {};
}
