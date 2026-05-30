import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppAssistProps {
  text?: string;
  linkText?: string;
  className?: string;
}

const WhatsAppAssist: React.FC<WhatsAppAssistProps> = ({
  text = 'Need help choosing your fit?',
  linkText = 'Chat with a stylist.',
  className = '',
}) => {
  const message = encodeURIComponent("Hello! I'm browsing the Bombo Twerk store and would love some styling and sizing advice.");
  const waUrl = `https://wa.me/5215555555555?text=${message}`;

  return (
    <div
      className={`flex items-center gap-3 bg-brand-charcoal border border-white/5 rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-brand-magenta/20 ${className}`}
    >
      <div className="bg-brand-magenta/10 p-2.5 rounded-lg shrink-0">
        <MessageCircle className="w-5 h-5 text-brand-magenta" />
      </div>
      <div className="font-sans text-xs md:text-sm leading-relaxed">
        <span className="text-neutral-400 font-light">{text} </span>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-magenta font-black hover:text-white transition-colors underline decoration-brand-magenta/30 hover:decoration-white underline-offset-4"
        >
          {linkText}
        </a>
      </div>
    </div>
  );
};

export default WhatsAppAssist;
