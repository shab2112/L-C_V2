import React from 'react';

export const Stats: React.FC = () => {
  const stats = [
    { value: "15K+", label: "Properties Analyzed" },
    { value: "98%", label: "Client Satisfaction" },
    { value: "24/7", label: "AI Assistant Available" },
    { value: "2.5x", label: "Faster Property Discovery" }
  ];

  return (
    <section className="bg-[#020617] py-12 relative overflow-hidden border-b border-white/5">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
             backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
             backgroundSize: '40px 40px'
        }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 md:p-8 text-center shadow-lg hover:border-[#38bdf8]/30 transition-all duration-300 group">
              <h3 className="text-3xl md:text-4xl font-bold text-[#38bdf8] mb-3">{stat.value}</h3>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};