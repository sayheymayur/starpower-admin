import React, { useState, useEffect, useRef } from "react";

export const ChurnRate: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const chartData = [4.5, 4.3, 4.2, 4.1, 4.3, 4.2, 4.26];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    // Reduced loading duration
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const xPos = e.clientX - svgRect.left;
    const pointIndex = Math.min(
      Math.floor(xPos / (100 / (chartData.length - 1))),
      chartData.length - 1
    );
    
    setHoveredPoint(pointIndex);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Churn Rate
          </h3>
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            Downgrade to Free plan
          </p>
        </div>
        
        {/* Three-dot menu button */}
        <button
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </button>
        
        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute right-4 top-10 z-10 w-32 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <button className="block w-full px-4 py-2 text-left text-theme-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
              View More
            </button>
            <button className="block w-full px-4 py-2 text-left text-theme-sm text-red-600 hover:bg-gray-50 dark:text-red-500 dark:hover:bg-gray-700">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex justify-between items-end">
        <div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-1">
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : hoveredPoint !== null ? (
              `${chartData[hoveredPoint]}%`
            ) : (
              "4.26%"
            )}
          </div>
          <div className="text-theme-xs text-red-500 font-medium">
            {isLoading ? (
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : hoveredPoint !== null ? (
              <span className="text-gray-500 dark:text-gray-400">
                {labels[hoveredPoint]}
              </span>
            ) : (
              <>
                <span>0.31%</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  than last Week
                </span>
              </>
            )}
          </div>
        </div>

        {/* Interactive chart */}
        <div className="w-[100px] h-[50px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : (
            <svg 
              ref={svgRef}
              width="100" 
              height="50" 
              viewBox="0 0 100 50"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="cursor-pointer"
            >
              {/* Grid line */}
              <line
                x1="0" y1="50" x2="100" y2="50"
                stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,2"
                className="dark:stroke-gray-700"
              />
              
              {/* Smooth chart line with animation */}
              <path
                d={`M0,${50 - chartData[0] * 10} C14,${50 - chartData[0] * 10} 14,${50 - chartData[1] * 10} 28,${50 - chartData[1] * 10} C42,${50 - chartData[1] * 10} 42,${50 - chartData[2] * 10} 56,${50 - chartData[2] * 10} C70,${50 - chartData[2] * 10} 70,${50 - chartData[3] * 10} 84,${50 - chartData[3] * 10}`}
                stroke="#EF4444" strokeWidth="2" fill="none"
                strokeDasharray="1000" strokeDashoffset="1000"
                style={{
                  animation: "draw 1.5s ease forwards",
                }}
              >
                <style>{`
                  @keyframes draw {
                    to { stroke-dashoffset: 0; }
                  }
                `}</style>
              </path>
              
              {/* Data points */}
              {chartData.map((point, index) => (
                <circle
                  key={index}
                  cx={index * 14}
                  cy={50 - point * 10}
                  r={hoveredPoint === index ? "3.5" : "2"}
                  fill={hoveredPoint === index ? "#EF4444" : "transparent"}
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  style={{
                    transition: "all 0.2s ease",
                    opacity: hoveredPoint === null || hoveredPoint === index ? 1 : 0.6
                  }}
                />
              ))}
              
              {/* Hover indicator */}
              {hoveredPoint !== null && (
                <>
                  <circle
                    cx={hoveredPoint * 14}
                    cy={50 - chartData[hoveredPoint] * 10}
                    r="5"
                    fill="#EF4444"
                    fillOpacity="0.2"
                  />
                  <text
                    x={hoveredPoint * 14}
                    y={50 - chartData[hoveredPoint] * 10 - 8}
                    textAnchor="middle"
                    fill="#EF4444"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {chartData[hoveredPoint]}%
                  </text>
                </>
              )}
              
              {/* Area under the curve */}
              <defs>
                <linearGradient
                  id="churnGradient"
                  x1="0" y1="0" x2="0" y2="50"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#EF4444" stopOpacity="0.15" />
                  <stop offset="1" stopColor="#EF4444" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M0,50 C14,50 14,${50 - chartData[0] * 10} 28,${50 - chartData[1] * 10} C42,${50 - chartData[1] * 10} 42,${50 - chartData[2] * 10} 56,${50 - chartData[2] * 10} C70,${50 - chartData[2] * 10} 70,${50 - chartData[3] * 10} 84,${50 - chartData[3] * 10} L84,50 Z`}
                fill="url(#churnGradient)"
                style={{
                  opacity: 0.7,
                  transition: "opacity 0.3s ease"
                }}
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};