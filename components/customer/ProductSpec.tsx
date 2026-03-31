import { PRODUCT_LIST_TYPE } from "@/utils/Types";

export const ProductSpecifications = ({ product }: { product: PRODUCT_LIST_TYPE }) => {
    const specs = product?.productDetails?.specifications;
    const specEntries = specs ? Object.entries(specs) : [];


    if (specEntries.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 italic">
                No technical specifications available for this product.
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-sm text-left border-collapse">

                <caption className="sr-only">Product Technical Specifications</caption>

                <tbody>
                    {specEntries.map(([key, value], idx) => (
                        <tr
                            key={key}
                            className={`
                group border-b border-gray-100 last:border-0 transition-colors
                ${idx % 2 === 0 ? 'bg-gray-50/40' : 'bg-white'}
                hover:bg-blue-50/30 cursor-pointer`}
                        >

                            <td className="py-4 px-6 font-semibold text-gray-900 w-1/3 align-top capitalize">
                                {key.replace(/_/g, ' ')}
                            </td>


                            <td className="py-4 px-6 text-gray-600 leading-relaxed">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};