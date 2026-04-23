export function mapOrderDetails(raw: any) {

    const inventory = raw.items?.[0]?.productVariant?.inventory?.[0] || null;
    return {
        id: raw.id,
        total_amount: raw.total_amount,
        created_at: raw.created_at,
        user: {
            id: raw.customer?.id,
            first_name: raw.customer?.first_name,
            last_name: raw.customer?.last_name,
            email: raw.customer?.email,
            phone_number: raw.customer?.phone_number ?? null,
        },
        items: (raw.items ?? []).map((item: any, index: number) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            order_status: item.order_status,
            // Lift warehouse_id from nested inventory[0]
            warehouse_id: item.productVariant?.inventory?.[index]?.warehouse.id ?? null,
            warehouse_name: item.productVariant?.inventory?.[index]?.warehouse?.name ?? null,
            tracking_url: item.tracking_url ?? null,
            invoice_url: item.invoice_url ?? null,
            productVariant: {
                id: item.productVariant?.id,
                variant_name: item.productVariant?.variant_name,
                price: item.productVariant?.price,
                images: item.productVariant?.images ?? [],
            },
        })),
        address: raw.address
            ? {
                name: raw.address.name,
                address_line1: raw.address.address_line_1,  // normalize snake_case
                address_line2: raw.address.address_line_2,
                city: raw.address.city,
                state: raw.address.state,
                postal_code: raw.address.postal_code,
                country: raw.address.country,
            }
            : null,
        payment: raw.payment ?? null,
        shipping: raw.shipping ?? { tracking_url: null },
    };
}