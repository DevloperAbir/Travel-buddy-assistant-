
import React, { useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 gradient-bg flex flex-col items-center justify-center text-white z-50 transition-opacity duration-1000">
      <div className="text-center space-y-6 animate-bounce">
        <div className="bg-white p-6 rounded-full inline-block shadow-2xl">
          <i className="fa-solid fa-plane-departure text-5xl text-blue-600"></i>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          ওয়েলকাম টু <br/>
          <span className="text-yellow-400">Travel Baddy Assistant</span>
        </h1>
        <p className="text-lg opacity-80">আপনার যাত্রা হোক নিরাপদ ও স্বাচ্ছন্দ্যময়</p>
      </div>
      <div className="absolute bottom-10 animate-pulse">
        লোডিং হচ্ছে...
      </div>
    </div>
  );
};

export default WelcomeScreen;
