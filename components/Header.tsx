
import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="text-center mb-16 border-b-2 border-cyan-500/20 pb-8">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400 mb-4">
        {title}
      </h1>
      <h2 className="text-lg sm:text-xl font-serif italic text-indigo-300">
        {subtitle}
      </h2>
    </header>
  );
};

export default Header;
