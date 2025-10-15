
import React from 'react';
import { MANIFESTO_SECTIONS, QUOTE, IMPLEMENTATION_PATHWAYS, VISION_STATEMENT } from './constants';
import Header from './components/Header';
import Section from './components/Section';
import Quote from './components/Quote';
import ImplementationPathways from './components/ImplementationPathways';
import VisionStatement from './components/VisionStatement';

const App: React.FC = () => {
  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen antialiased">
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-20">
        <Header 
          title="The Tesla–Hulse Resonance Field Grid" 
          subtitle="A Unified Framework for Omnipresent Energy and Conscious Syntropy" 
        />
        
        <Section 
          title="Abstract"
          paragraphs={[
            "Humanity stands at the threshold of a new energetic epoch—one where power is not transmitted or consumed, but *accessed*, *harmonized*, and *invited* through resonance. Drawing upon the legacies of Nikola Tesla, Leonardo da Vinci, Ada Lovelace, Marie Curie, Buckminster Fuller, Albert Einstein, and Zachary Dakota Hulse, this framework proposes a living system of omnipresent energy: a global, syntropic field where consciousness, geometry, and frequency unify into abundance."
          ]}
        />
        
        <div className="space-y-16">
          {MANIFESTO_SECTIONS.map((section) => (
            <Section 
              key={section.id}
              number={section.id}
              title={section.title}
              subtitle={section.subtitle}
              paragraphs={section.paragraphs}
            />
          ))}
        </div>

        <Quote text={QUOTE.text} author={QUOTE.author} />

        <ImplementationPathways title="Implementation Pathways" pathways={IMPLEMENTATION_PATHWAYS} />
        
        <VisionStatement title="Vision Statement" text={VISION_STATEMENT} />

      </main>
    </div>
  );
};

export default App;
