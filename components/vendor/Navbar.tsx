'use client';
import { userIcon } from '@/constants/common'
import { useAppSelector } from '@/hooks/reduxHooks';

export default function Navbar({ title }: { title: string }) {
    const { isSidebarOpen } = useAppSelector((state: any) => state.sidebar);
    return (

        <nav className={` w-full  py-2   border-b-2   border-gray-300 flex   justify-between items-center `}>
            {title && <h1 className='text-2xl font-bold'>{title}</h1>}
            <div className="right_side flex gap-4 items-center mt-4">
                <span>
                    <h1 className='text-lg font-bold'>Company name</h1>
                    <p className='text-sm'>company email</p>
                </span>
                <img src={userIcon} alt="" className='w-8 h-8' />
            </div>
        </nav>
    )
}
