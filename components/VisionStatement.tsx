
import React from 'react';

interface VisionStatementProps {
  title: string;
  text: string[];
}

const parseText = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
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

const VisionStatement: React.FC<VisionStatementProps> = ({ title, text }) => {
  return (
    <section className="mt-20 pt-10 border-t-2 border-cyan-500/20 text-center">
       <div className="flex items-start gap-4 text-left">
        <div className="text-5xl font-bold text-gray-700/80 font-serif -mt-2">
          10.
        </div>
        <div className="flex-1">
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-gray-100 mb-8">{title}</h3>
            <div className="space-y-4 text-lg text-gray-200 leading-loose text-center">
                {text.map((line, index) => (
                <p key={index}>{parseText(line)}</p>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default VisionStatement;
