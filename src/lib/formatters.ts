/**
 * Formats a raw numeric string to the Indian numbering system format (e.g. 1,00,000)
 */
export function formatIndianNumber(value: string): string {
  // Strip all non-digits
  const cleanValue = value.replace(/[^0-9]/g, '');
  if (!cleanValue) return '';
  
  const num = parseInt(cleanValue, 10);
  if (isNaN(num)) return '';
  
  // If it's less than 1000, no extra formatting needed
  if (num < 1000) return num.toString();
  
  const str = num.toString();
  const lastThree = str.substring(str.length - 3);
  const otherParts = str.substring(0, str.length - 3);
  
  // Group the remaining digits to the left of the last 3 digits by twos
  const formattedOthers = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${formattedOthers},${lastThree}`;
}

/**
 * Parses a comma-separated Indian currency string back to a raw number
 */
export function parseIndianNumber(value: string): number {
  const cleanValue = value.replace(/,/g, '');
  const num = Number(cleanValue);
  return isNaN(num) ? 0 : num;
}
