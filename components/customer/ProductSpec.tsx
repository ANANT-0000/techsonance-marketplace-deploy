import { AttributesType, ProductFeatureType, ProductResponseType, VariantsType } from "@/utils/Types";


export const ProductSpecifications = ({ product }: { product: ProductFeatureType[] }) => {
    console.log(product)
    

    if (!product || product.length === 0) {
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
                        {product.map((sp, idx) => (
                            <tr
                                key={idx}
                                className={`
                group border-b border-gray-100 last:border-0 transition-colors
                ${idx % 2 === 0 ? 'bg-gray-50/40' : 'bg-white'}
                hover:bg-blue-50/30 cursor-pointer`}
                            >

                                <td className="py-4 px-6 font-semibold text-gray-900 w-1/3 align-top capitalize">
                                    {sp.title}
                                    {/* {sp.key.replace(/_/g, ' ')} */}
                                </td>
                                <td className="py-4 px-6 text-gray-600 leading-relaxed">
                                    {typeof sp.description === 'boolean' ? (sp.description ? 'Yes' : 'No') : sp.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };