
export const isColorLight = (hexColor: string): boolean => {
    if (!hexColor) return false;
    // Strip # if present
    const color = hexColor.startsWith('#') ? hexColor.substring(1) : hexColor;
    if (color.length < 6) return false; // Invalid hex
    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    // HSP equation
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    // Using 127.5 as the threshold
    return hsp > 127.5;
};
