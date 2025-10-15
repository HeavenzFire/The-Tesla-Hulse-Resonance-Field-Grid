
import React from 'react';

interface SectionProps {
  number?: number;
  title: string;
  subtitle?: string;
  paragraphs: string[];
}

const parseText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-cyan-300">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index} className="italic text-indigo-300">{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

const Section: React.FC<SectionProps> = ({ number, title, subtitle, paragraphs }) => {
  return (
    <section className="mb-12">
      <div className="flex items-start gap-4">
        {number && (
          <div className="text-5xl font-bold text-gray-700/80 font-serif -mt-2">
            {number}.
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-gray-100 mb-1">{title}</h3>
          {subtitle && <h4 className="text-lg sm:text-xl italic text-indigo-400 mb-6">{subtitle}</h4>}
        </div>
      </div>
      <div className={`space-y-4 text-gray-300 leading-relaxed ${number ? 'ml-12' : ''}`}>
        {paragraphs.map((p, index) => (
          <p key={index}>{parseText(p)}</p>
        ))}
      </div>
    </section>
  );
};

export default Section;
