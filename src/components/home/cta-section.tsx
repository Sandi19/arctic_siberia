import React from 'react';
import { Play } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Готовы начать изучение?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Присоединяйтесь к тысячам студентов, которые уже изучают русский язык с нами. 
          Первый урок — бесплатно!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn btn-lg bg-white text-blue-600 hover:bg-blue-50 border-white px-8">
            <Play className="w-5 h-5 mr-2" />
            Попробовать бесплатно
          </button>
          <button className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-blue-600 px-8">
            Связаться с нами
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;