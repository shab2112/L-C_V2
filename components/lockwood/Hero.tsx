import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, CircleDollarSign, Play, Send, Bot, ExternalLink, X, MessageSquare, ArrowRight, Phone, ShieldCheck } from 'lucide-react';
import { buildDarieEnquiryPayload, sendMessageToDarie } from '../../services/geminiService';
import { Message, ChatState, Page } from '../../lockwood-types';
import { Tooltip } from '../Tooltip';

interface HeroProps {
  onNavigate?: (page: Page) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '<h3>Welcome to Lockwood & Carter.</h3><p>I am the L&C Digital Assistant. Our senior brokers are currently active in the market, but I can provide you with immediate property comparisons, ROI data, and project brochures. How can I assist your investment journey today?</p>', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>(ChatState.IDLE);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const darieEnquiryIdRef = useRef<string | null>(null);
  const darieEnquiryEmailRef = useRef<string | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => setReducedMotion(media.matches);

    updateReducedMotion();
    media.addEventListener('change', updateReducedMotion);

    return () => media.removeEventListener('change', updateReducedMotion);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  useEffect(() => {
    const openDarieChat = () => setIsChatOpen(true);
    window.addEventListener('lc-open-darie-chat', openDarieChat);
    return () => window.removeEventListener('lc-open-darie-chat', openDarieChat);
  }, []);

  const submitDarieEnquiry = async (completedMessages: Message[]) => {
    const enquiryPayload = buildDarieEnquiryPayload(completedMessages);
    const email = enquiryPayload?.email?.toLowerCase();
    if (!enquiryPayload || !email) return;

    const existingId = darieEnquiryEmailRef.current === email ? darieEnquiryIdRef.current : null;
    const response = await fetch('/api/enquiries', {
      method: existingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(existingId ? { id: existingId } : {}),
        ...enquiryPayload,
      }),
    });

    if (!response.ok) {
      throw new Error(`DARIE enquiry capture failed with ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    if (data?.success && data.data?.id) {
      darieEnquiryIdRef.current = data.data.id;
      darieEnquiryEmailRef.current = email;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    const nextUserMessages = [...messages, userMsg];
    setMessages(nextUserMessages);
    setInput('');
    setChatState(ChatState.LOADING);

    const response = await sendMessageToDarie(messages, input);

    const botMsg: Message = {
      role: 'model',
      text: response.text,
      timestamp: Date.now(),
      groundingMetadata: response.groundingMetadata
    };
    const completedMessages = [...nextUserMessages, botMsg];
    setMessages(completedMessages);
    setChatState(ChatState.SUCCESS);

    submitDarieEnquiry(completedMessages).catch(error => {
      console.warn('Failed to capture DARIE enquiry:', error);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/971564144401', '_blank');
  };

  return (
    
    <section className="relative min-h-[100svh] overflow-hidden bg-[#101820] lg:h-[100svh] lg:min-h-[720px] lg:max-h-[960px]">
      {/* Cinematic Background Video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/lockwood-assets/general/hero_image.png"
          alt="Luxury Dubai Penthouse"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        {!reducedMotion && !videoFailed && (
          <video
            src="/lockwood-assets/general/hero_video.mp4"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/lockwood-assets/general/hero_image.png"
            aria-hidden="true"
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
          />
        )}
        {/* Directional cinematic overlay, matched to the reference hero video treatment */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,24,32,0.92)_0%,rgba(16,24,32,0.74)_34%,rgba(16,24,32,0.28)_58%,rgba(16,24,32,0.035)_84%),linear-gradient(180deg,rgba(16,24,32,0.02)_0%,rgba(16,24,32,0.38)_100%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,32,0.74)_0%,rgba(16,24,32,0.62)_44%,rgba(16,24,32,0.88)_100%),linear-gradient(90deg,rgba(16,24,32,0.86)_0%,rgba(16,24,32,0.3)_100%)] md:hidden"></div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-[min(calc(100%_-_40px),1440px)] flex-col items-start justify-center px-0 pb-16 pt-28 text-left sm:pb-20 sm:pt-32 lg:h-full lg:min-h-0 lg:px-12 lg:pb-16 lg:pt-28 xl:pt-32">
        <div className="mb-5 inline-flex min-h-11 items-center gap-2 border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-2xl backdrop-blur-md md:px-5 md:text-sm">
          <ShieldCheck size={12} className="flex-shrink-0 text-lc-gold" />
          <span className="whitespace-nowrap">RERA Registered Brokerage #53772</span>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#B49A68] md:text-sm">
          Dubai Property Advisory
        </p>
        <h1 className="mb-0 max-w-[680px] font-serif text-[clamp(44px,6.2vw,88px)] font-normal leading-[1.01] text-white">
          Find your place in Dubai.
        </h1>
        <p className="mb-0 mt-6 block max-w-[560px] text-[clamp(16px,1.35vw,19px)] leading-[1.58] text-[#F5F0E6]/90">
          Local expertise, carefully selected properties, and clear guidance for buyers and investors worldwide.
        </p>


        {/* CTAs */}
        <div className="mt-8 flex w-full flex-col items-stretch gap-3.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <button
            onClick={() => onNavigate?.('PROJECTS')}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[2px] border border-[#F5F0E6] bg-[#F5F0E6] px-6 py-3.5 text-sm font-semibold tracking-wide text-[#122238] transition-colors hover:bg-[#E6DED0] sm:min-w-[180px]"
          >
            <ArrowRight size={18} />
            Explore Properties
          </button>
          <button 
            onClick={handleWhatsApp}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[2px] border border-[#F5F0E6]/45 bg-[#101820]/25 px-6 py-3.5 text-sm font-semibold text-[#F5F0E6] backdrop-blur-md transition-colors hover:border-[#B49A68] hover:text-white sm:min-w-[180px]"
          >
            <Phone size={20} className="text-lc-gold" /> Consult an Advisor
          </button>
          {/* Watch Demo Centered as per screenshot preference often */}
          <Tooltip content="A glimpse of Dubai" position="bottom">
            <button
              onClick={() => window.open('https://youtu.be/NAW8S7wxOWA', '_blank')}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[2px] border border-[#F5F0E6]/25 bg-transparent px-6 py-3.5 text-sm font-semibold tracking-wide text-[#F5F0E6]/85 transition-colors hover:border-[#B49A68] hover:text-white sm:min-w-[150px]"
            >
              <Play size={20} fill="currentColor" className="text-lc-gold" />
              Why Invest?
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">

        {/* Chat Window */}
        {isChatOpen && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-lc-navy text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-lc-gold p-1.5 rounded-lg relative">
                  <Bot size={18} className="text-white" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-lc-gold"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">L&C Digital Assistant</h3>
                  <p className="text-[10px] text-blue-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full gap-2`}>
                    {msg.role === 'model' && (
                      <div className="w-6 h-6 rounded-full bg-lc-gold/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot size={12} className="text-lc-gold" />
                      </div>
                    )}

                    <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed shadow-sm chat-message
                      ${msg.role === 'user'
                        ? 'bg-lc-gold text-white rounded-tr-none'
                        : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'}`}
                    >
                      <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                    </div>
                  </div>

                  {/* Sources Display */}
                  {msg.role === 'model' && msg.groundingMetadata?.groundingChunks && (
                    <div className="ml-8 mt-2 max-w-[85%] bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      <p className="text-[10px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                          if (chunk.web?.uri) {
                            return (
                              <a
                                key={i}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] bg-white text-blue-600 px-2 py-1 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                              >
                                {chunk.web.title || "PropSearch Data"} <ExternalLink size={8} />
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {chatState === ChatState.LOADING && (
                <div className="flex justify-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-lc-gold/10 flex items-center justify-center mt-1">
                    <Bot size={12} className="text-lc-gold" />
                  </div>
                  <div className="bg-white p-3 rounded-xl rounded-tl-none border border-gray-100 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
              {messages.length === 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
                  <button onClick={() => { setInput("Compare visible Dubai South listings"); }} className="inline-flex items-center whitespace-nowrap bg-gray-50 border border-gray-200 text-[10px] text-gray-600 px-3 py-1 rounded-full hover:border-lc-gold hover:text-lc-gold transition-colors">
                    <BarChart3 className="mr-1 h-3 w-3" /> Compare Projects
                  </button>
                  <button onClick={() => { setInput("3BR prices in Dubai South"); }} className="inline-flex items-center whitespace-nowrap bg-gray-50 border border-gray-200 text-[10px] text-gray-600 px-3 py-1 rounded-full hover:border-lc-gold hover:text-lc-gold transition-colors">
                    <CircleDollarSign className="mr-1 h-3 w-3" /> 3BR Prices
                  </button>
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about Dubai properties..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-lc-gold focus:border-lc-gold"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-lc-gold hover:text-lc-goldHover disabled:opacity-50 disabled:cursor-not-allowed p-1.5 rounded-md transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <Tooltip content={isChatOpen ? "Close chat" : "Chat with AI Advisor"} position="left">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110 relative
              ${isChatOpen ? 'bg-white text-lc-navy hover:bg-gray-100' : 'bg-lc-gold text-white hover:bg-lc-goldHover'}`}
          >
            {isChatOpen ? <X size={24} /> : <MessageSquare size={24} fill="currentColor" />}

            {/* Online Indicator on Floating Button */}
            {!isChatOpen && (
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-lc-navy"></span>
              </span>
            )}
          </button>
        </Tooltip>
      </div>

    </section>
  );
};
