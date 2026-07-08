import { useState, useEffect } from 'react';

export function useDarkMode() {
    const [theme, setTheme] = useState(() => {
        // Ensure this only runs in the browser
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) {
                return storedTheme;
            }
            // Default to system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light'; // Fallback
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Apply Tailwind's dark class logic
        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }

        // Persist to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return { theme, toggleTheme };
}

export default useDarkMode;
