'use client';
import { SlidersHorizontal, ChevronUp, ChevronRight, X, ChevronDown } from 'lucide-react'
import { type PRODUCT_LIST_TYPE } from '@/constants/customer'
import { useEffect, useState } from 'react'
const SidebarContent = ({ setIsOpen, maxPrice, setMaxPrice, minPrice, setMinPrice, isPriceOpen, setIsPriceOpen, categoryFilter, setSelectedCategories, selectedCategories }: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  maxPrice: number,
  setMaxPrice: React.Dispatch<React.SetStateAction<number>>,
  minPrice: number,
  setMinPrice: React.Dispatch<React.SetStateAction<number>>,
  isPriceOpen: boolean,
  setIsPriceOpen: React.Dispatch<React.SetStateAction<boolean>>,
  categoryFilter: string[],
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>,
  selectedCategories: string[]
}) => (
  <div className="flex flex-col gap-8">
    <div className='flex items-center justify-between pb-4 border-b border-gray-100'>
      <h1 className='text-lg font-bold text-gray-800'>Filter</h1>
      <button onClick={() => setIsOpen(false)} className="lg:hidden">
        <X size={20} />
      </button>
      <SlidersHorizontal size={20} className="hidden lg:block text-gray-500" />
    </div>


    <section className='border-b border-gray-50 pb-0'>
      <div className='flex items-center justify-between mb-6 cursor-pointer group' onClick={() => setIsPriceOpen(!isPriceOpen)}>
        <h2 className='text-sm font-bold text-gray-700 uppercase tracking-tighter'>Price</h2>
        {isPriceOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </div>

      {isPriceOpen && (
        <div className="space-y-6">
          {/* Visual Slider Mockup (Syncs with Max Price) */}
          <div className="relative h-1.5 w-full bg-blue-50 rounded-full">
            <div
              className="absolute h-full bg-blue-500 rounded-full"
              style={{ width: `${Math.min((maxPrice / 50000) * 100, 100)}%` }}
            ></div>
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-sm"></div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-sm transition-all"
              style={{ left: `calc(${Math.min((maxPrice / 50000) * 100, 100)}% - 8px)` }}
            ></div>
          </div>

          <div className='flex items-center gap-3'>
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Min</span>
              <div className="border border-gray-200 rounded-md p-2 text-sm text-gray-700 flex items-center focus-within:border-blue-400">
                <span className="text-gray-400 mr-1">₹</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Max</span>
              <div className="border border-gray-200 rounded-md p-2 text-sm text-gray-700 flex items-center focus-within:border-blue-400">
                <span className="text-gray-400 mr-1">₹</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>

    <section>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-md font-semibold text-gray-700'>Category</h2>
        <ChevronUp size={18} />
      </div>
      <div className='flex flex-col gap-3  overflow-y-scroll h-full'>
        {categoryFilter.map((cat) => (
          <div
            key={cat}
            onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
            className="flex items-center justify-between cursor-pointer group"
          >
            <span className={`text-sm ${selectedCategories.includes(cat) ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>{cat}</span>
            <ChevronRight size={14} className="text-gray-300" />
          </div>
        ))}
      </div>
    </section>
  </div>
);
export function FilterSidebar({ PRODUCT_LIST, filterProduct }: {
  PRODUCT_LIST: PRODUCT_LIST_TYPE[],
  filterProduct: React.Dispatch<React.SetStateAction<PRODUCT_LIST_TYPE[]>>
}) {
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isColorsOpen, setIsColorsOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer state
  const [categoryFilter] = useState<string[]>([...new Set(PRODUCT_LIST.map(pro => pro.category))])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000); // Default high ceiling
  const colors = [
    { name: 'Navy', class: 'bg-blue-600' },
    { name: 'Black', class: 'bg-gray-900' },
    { name: 'Red', class: 'bg-red-500' },
    { name: 'Yellow', class: 'bg-yellow-400' },
    { name: 'White', class: 'bg-white border' },
    { name: 'Blue', class: 'bg-blue-400' }
  ];

  useEffect(() => {
    let filtered = selectedCategories.length === 0
      ? PRODUCT_LIST
      : PRODUCT_LIST.filter(pro => selectedCategories.includes(pro.category));
    filtered = filtered.filter(pro => pro.price >= minPrice && pro.price <= maxPrice);

    filterProduct(filtered);
  }, [selectedCategories, minPrice, maxPrice, filterProduct]);
  // Sidebar Content (Extracted to avoid repetition)


  return (
    <>

      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-20 right-6 z-50 bg-black text-white p-4 rounded-full shadow-xl flex items-center gap-2"
      >
        <SlidersHorizontal size={20} />
        <span className="font-semibold text-sm">Filters</span>
      </button>


      <aside className='hidden lg:block lg:w-72 w-[60%] bg-white border-r border-gray-200 p-6 h-screen sticky top-0'>
        <SidebarContent setIsOpen={setIsOpen} maxPrice={maxPrice} setMaxPrice={setMaxPrice} minPrice={minPrice} setMinPrice={setMinPrice} isPriceOpen={isPriceOpen} setIsPriceOpen={setIsPriceOpen} categoryFilter={categoryFilter} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} />
      </aside>


      <div className={`fixed inset-0 z-[60] lg:hidden transition-visibility duration-300 ${isOpen ? 'visible' : 'invisible'}`}>

        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />
        {/* Drawer Panel */}
        <aside className={`absolute left-0 top-0 h-full lg:w-72 w-[60%] bg-white p-6 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent setIsOpen={setIsOpen} maxPrice={maxPrice} setMaxPrice={setMaxPrice} minPrice={minPrice} setMinPrice={setMinPrice} isPriceOpen={isPriceOpen} setIsPriceOpen={setIsPriceOpen} categoryFilter={categoryFilter} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} />
        </aside>
      </div>
    </>
  )
}