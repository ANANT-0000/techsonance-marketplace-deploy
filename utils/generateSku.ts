interface SkuParams {
  productName: string;
  categoryName?: string;
  attributes?: { name: string; value: string }[];
}
// SKU Format:

// Brand: ST
// Style Code: WT019B-01
// Color: OW (Off White)
// Size:
// M
// L
// XL
// 2XL

// Example

// ST-WT019B-01-OW-L
// ST-WT019B-01-OW-XL
// ST-WT019B-01-OW-2XL
export function generateSKU({
  productName,
  categoryName,
  attributes,
}: SkuParams): string {
  const parts: string[] = [];

  // 1. Process Product Name (e.g., "ST WT019B-01" -> "ST-WT019B-01")
  if (productName) {
    let cleanName = productName.toUpperCase().trim();
    // Remove special characters except alphanumeric, spaces, and hyphens
    cleanName = cleanName.replace(/[^A-Z0-9\s-]/g, "");

    // If the name is long, create an acronym from the first few words
    if (cleanName.length > 15) {
      cleanName = cleanName
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .substring(0, 6); // max 6 char acronym
    } else {
      // If it's short (like a style code), just format it
      cleanName = cleanName.replace(/\s+/g, "-");
    }

    if (cleanName) {
      parts.push(cleanName);
    }
  }

  // 2. Add Variant Attributes (e.g., "Off White" -> "OW", "L" -> "L")
  if (attributes && attributes.length > 0) {
    const attrValues = attributes.map((attr) => {
      const strVal = String(attr.value).toUpperCase().trim();
      // If it contains spaces, use initials (e.g., "Off White" -> "OW")
      if (strVal.includes(" ")) {
        return strVal
          .split(/\s+/)
          .map((word) => word[0])
          .join("");
      }
      // Otherwise, keep it as is (e.g., "L", "XL", "RED")
      return strVal;
    });
    parts.push(...attrValues);
  }

  // Combine and clean up (remove trailing/leading dashes and multiple dashes)
  return parts
    .filter(Boolean)
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
