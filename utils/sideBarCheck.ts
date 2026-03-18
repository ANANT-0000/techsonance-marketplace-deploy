'use client';
import { useSelector } from "react-redux";

export function useIsSidebarOpen(): boolean {
    const { isSidebarOpen } = useSelector((state: any) => state.sidebar);
    return isSidebarOpen;
}