import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Evita el error de hidratación renderizando solo después del montaje
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9 sm:w-10 sm:h-10"></div>; // Placeholder para evitar el CLS (layout shift)
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation active:scale-95 text-gray-600 dark:text-gray-300 hover:text-[var(--color-brand-primary)] dark:hover:text-[var(--color-brand-primary)]"
            aria-label="Alternar modo oscuro"
            title="Alternar modo oscuro"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};
