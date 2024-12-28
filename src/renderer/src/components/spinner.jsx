/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */


export const CircularSpinner = () => {
    const radius = 40;
    const stroke = 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
  
    return (
      <svg 
        height={radius * 2} 
        width={radius * 2} 
        className="animate-spin"
      >
        {/* Background Circle */}
        <circle
          stroke="#e6e6e6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        {/* Progress Circle */}
        <circle
          stroke="#4299e1" // Tailwind blue-500
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeDasharray={`${circumference / 4} ${circumference}`}
          className="origin-center"
        />
      </svg>
    );
  };