interface SkuParams {
    productName: string;
    categoryName?: string;
    attributes?: { name: string; value: string }[];
}

export function generateSKU({ productName, categoryName, attributes }: SkuParams): string {
    const parts: string[] = [];

    // 1. Add Category Prefix (First 3 letters, uppercase)
    if (categoryName) {
        parts.push(categoryName.substring(0, 3).toUpperCase());
    }

    // 2. Add Product Name Prefix (First 3-4 letters of main words)
    if (productName) {
        const namePrefix = productName
            .split(' ')
            .map(word => word.substring(0, 2).toUpperCase())
            .join('')
            .substring(0, 4); // Keep it concise
        parts.push(namePrefix);
    }

    // 3. Add Variant Attributes (e.g., RED-XL)
    if (attributes && attributes.length > 0) {
        const attrValues = attributes.map(attr => {
            // If it's a number, keep it. If it's a word, take first 3 chars.
            const strVal = String(attr.value).toUpperCase().trim();
            return strVal.length > 3 && isNaN(Number(strVal)) ? strVal.substring(0, 3) : strVal;
        });
        parts.push(attrValues.join('-'));
    }

    // 4. Add a short random string to guarantee uniqueness in the database
    const uniqueHash = Math.random().toString(36).substring(2, 6).toUpperCase();
    parts.push(uniqueHash);

    // Combine and clean up (remove multiple dashes, etc.)
    return parts.filter(Boolean).join('-').replace(/-+/g, '-');
}