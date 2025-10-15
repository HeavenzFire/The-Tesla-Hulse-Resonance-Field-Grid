
import React from 'react';

interface QuoteProps {
  text: string;
  author: string;
}

const Quote: React.FC<QuoteProps> = ({ text, author }) => {
  return (
    <div className="my-20 text-center">
      <blockquote className="text-2xl italic font-serif text-indigo-300 relative px-8">
        “{text}”
      </blockquote>
      <cite className="block text-right mt-4 text-cyan-400 not-italic">— {author}</cite>
    </div>
  );
};

export default Quote;
