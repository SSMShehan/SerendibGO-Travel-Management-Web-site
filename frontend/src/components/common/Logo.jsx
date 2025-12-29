import React from 'react';

const Logo = ({ className = "w-12 h-12" }) => {
  return (
    <div className={`${className} bg-[#E59B2C] rounded-full flex items-center justify-center`}>
      <span className="text-white font-bold text-lg">S</span>
    </div>
  );
};

export default Logo;
