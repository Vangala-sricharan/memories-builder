import React from 'react';
import { ParticleShape } from '../types';
import { Sparkles, Heart, Star, Circle, Gem, Activity, Compass } from 'lucide-react';

interface ParticleMorphControllerProps {
  currentShape: ParticleShape;
  onSelectShape: (shape: ParticleShape) => void;
  className?: string;
  compact?: boolean;
}

const SHAPES: { id: ParticleShape; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'abstract', label: 'Cinematic Field', icon: Sparkles },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'star', label: 'Star', icon: Star },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'diamond', label: 'Diamond', icon: Gem },
  { id: 'balloon', label: 'Celebration Balloon', icon: Activity },
  { id: 'galaxy', label: 'Cosmic Galaxy', icon: Compass },
];

export const ParticleMorphController: React.FC<ParticleMorphControllerProps> = ({
  currentShape,
  onSelectShape,
  className = '',
  compact = false,
}) => {
  return (
    <div
      role="region"
      aria-label="Particle Shape Morphing Controls"
      className={`inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-[#0F0F0F]/80 backdrop-blur-md border border-[#292929] rounded-xl shadow-2xl ${className}`}
    >
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium tracking-wider uppercase text-neutral-400 border-r border-[#292929] mr-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
        <span>Morph System</span>
      </div>

      <div className="flex items-center flex-wrap gap-1">
        {SHAPES.map((item) => {
          const Icon = item.icon;
          const isActive = currentShape === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectShape(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25 ring-1 ring-[#E50914]'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
              title={`Morph particles to ${item.label}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
              <span className={compact ? 'hidden md:inline' : 'inline'}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
