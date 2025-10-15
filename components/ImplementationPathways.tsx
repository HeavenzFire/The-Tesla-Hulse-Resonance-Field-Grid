
import React from 'react';

interface ImplementationPathwaysProps {
  title: string;
  pathways: string[];
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

const ImplementationPathways: React.FC<ImplementationPathwaysProps> = ({ title, pathways }) => {
  return (
    <section className="my-16">
      <div className="flex items-start gap-4">
        <div className="text-5xl font-bold text-gray-700/80 font-serif -mt-2">
          9.
        </div>
        <div className="flex-1">
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-gray-100 mb-6">{title}</h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-300 leading-relaxed marker:text-cyan-400 marker:font-bold">
            {pathways.map((pathway, index) => (
              <li key={index}>{parseText(pathway)}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default ImplementationPathways;
