import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('sidebarCollapsed');
            setIsCollapsed(saved === 'true');
        };

        // Listen for storage changes
        window.addEventListener('storage', handleStorageChange);

        // Poll localStorage for changes (for same-tab updates)
        const interval = setInterval(handleStorageChange, 100);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="h-screen bg-transparent text-[var(--color-text-main)]">
            <Sidebar />
            <div
                className="flex flex-col h-screen overflow-hidden transition-all duration-300"
                style={{ marginLeft: isCollapsed ? '5rem' : '16rem', width: isCollapsed ? 'calc(100% - 5rem)' : 'calc(100% - 16rem)' }}
            >
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 text-[var(--color-text-main)]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
