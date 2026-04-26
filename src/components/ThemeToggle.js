import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-foreground"
      aria-label="Toggle Theme"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 transition-all duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="w-5 h-5 transition-all duration-300 rotate-0 scale-100" />
      )}
    </button>
  );
};

export default ThemeToggle;