"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/* ---------------------------------------------
   Chart Data for Heart Rate
--------------------------------------------- */
const chartData = {
  labels: [
    "16:47",
    "16:48",
    "16:49",
    "16:50",
    "16:51",
    "16:52",
    "16:53",
    "16:54",
    "16:55",
    "16:56",
    "16:57",
    "16:58",
    "16:59",
  ],
  datasets: [
    {
      label: "Heart Rate",
      data: [80, 81, 80, 83, 82, 84, 82, 81, 83, 84, 82, 80, 82],
      fill: false,
      borderColor: "red",
      tension: 0, // no curve
      borderWidth: 1, // thinner line
      // borderDash: [4, 4], // dashed line segments to break it up
      pointRadius: 2,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: {
      ticks: {
        color: "gray",
        font: { size: 10 },
        maxRotation: 0,
        minRotation: 0,
      },
      grid: { display: false },
    },
    y: {
      display: false,
    },
  },
};

/* ---------------------------------------------
   ActivityRing Component
--------------------------------------------- */
type ActivityRingProps = {
  progress: number; // value from 0 to 1
  color: string;    // solid color, e.g. "#FF007F"
  radius: number;
  strokeWidth: number;
};

const ActivityRing: React.FC<ActivityRingProps> = ({
  progress,
  color,
  radius,
  strokeWidth,
}) => {
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <motion.circle
      cx="50%"
      cy="50%"
      r={radius}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="transparent"
      strokeDasharray={circumference}
      strokeLinecap="round"
      initial={{ strokeDashoffset: circumference }}
      animate={{ strokeDashoffset: dashOffset }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
  );
};

/* ---------------------------------------------
   ActivityRingsCard Component
--------------------------------------------- */
const ActivityRingsCard: React.FC = () => {
  const outerSize = 140;
  const strokeWidth = 16;
  const gap = 4;
  const outerRadius = (outerSize - strokeWidth) / 2;
  const middleRadius = outerRadius - (strokeWidth + gap);
  const innerRadius = middleRadius - (strokeWidth + gap);

  return (
    <div className="flex items-center justify-between p-3">
      {/* Left Column: Activity Text */}
      <div className="flex flex-col space-y-3">
        {/* Move */}
        <div>
          <p className="text-white text-lg font-semibold">Move</p>
          <p className="text-sm">
            <span className="font-semibold" style={{ color: "#FF007F" }}>
              306/170
            </span>
            <span className="text-xs font-semibold" style={{ color: "#FF007F" }}>
              KCAL
            </span>
          </p>
        </div>
        {/* Exercise */}
        <div>
          <p className="text-white text-lg font-semibold">Exercise</p>
          <p className="text-sm">
            <span className="font-semibold" style={{ color: "#32CD32" }}>
              48/30
            </span>
            <span className="text-xs font-semibold" style={{ color: "#32CD32" }}>
              MIN
            </span>
          </p>
        </div>
        {/* Stand */}
        <div>
          <p className="text-white text-lg font-semibold">Stand</p>
          <p className="text-sm">
            <span className="font-semibold" style={{ color: "#64D2FF" }}>
              9/12
            </span>
            <span className="ml-2 text-xs font-semibold" style={{ color: "#64D2FF" }}>
              HR
            </span>
          </p>
        </div>
      </div>

      {/* Right: Concentric Activity Rings */}
      <svg
        width={outerSize}
        height={outerSize}
        viewBox={`0 0 ${outerSize} ${outerSize}`}
        className="rotate-[-90deg]"
      >
        {/* Background track rings */}
        <circle
          cx="50%"
          cy="50%"
          r={outerRadius}
          stroke="#f20d51"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx="50%"
          cy="50%"
          r={middleRadius}
          stroke="#26b11f"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx="50%"
          cy="50%"
          r={innerRadius}
          stroke="#476b7a"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Colored (progress) Rings using solid colors */}
        <ActivityRing
          progress={0.89}
          color="#FF007F"
          radius={outerRadius}
          strokeWidth={strokeWidth}
        />
        <ActivityRing
          progress={0.85}
          color="#32CD32"
          radius={middleRadius}
          strokeWidth={strokeWidth}
        />
        <ActivityRing
          progress={0.75}
          color="#64D2FF"
          radius={innerRadius}
          strokeWidth={strokeWidth}
        />
      </svg>
    </div>
  );
};

/* ---------------------------------------------
   StatsCard Component
--------------------------------------------- */
const StatsCard: React.FC = () => {
  return (
    <div className="flex justify-between px-3 py-2">
      <div className="flex flex-col">
        <p className="text-white text-xs font-semibold">Steps</p>
        <p className="text-gray-400 text-lg font-semibold">8,500</p>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-white text-xs font-semibold">Distance</p>
        <p className="text-gray-400 text-lg font-semibold">6.2 km</p>
      </div>
    </div>
  );
};

/* ---------------------------------------------
   OutdoorCycleDetail Component (Full-Screen Detail View)
--------------------------------------------- */
const OutdoorCycleDetail: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <motion.div
      className="absolute top-0 left-0 w-full h-full bg-black text-white flex flex-col z-50"
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Modified Header */}
      <header className="px-4 py-3 border-b border-gray-700 flex items-center">
        {/* Left: Back Arrow & Summary text */}
        <div className="flex items-center">
          <button onClick={onBack} className="flex items-center">
            <div className="p-1 bg-transparent rounded-full">
              <svg
                className="w-4 h-4"
                viewBox="0 0 8 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 2L2 8L6 14"
                  stroke="#32CD32"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm font-bold pl-0" style={{ color: "#32CD32" }}>
              Summary
            </span>
          </button>
        </div>
        {/* Center: Date */}
        <div className="flex-1 text-center">
          <p className="text-white text-xs mr-14">Tue 14 Feb</p>
        </div>
        {/* Right: Share Icon */}
        <div className="flex items-center">
          <svg
            viewBox="0 0 48 48"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            fill="#75ff1a"
            stroke="#75ff1a"
            width="24"
            height="24"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <title>ic_fluent_share_ios_48_filled</title>
              <desc>Created with Sketch.</desc>
              <g id="🔍-Product-Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="ic_fluent_share_ios_48_filled" fill="#75ff1a" fillRule="nonzero">
                  <path d="M37.75,20.25 C38.6681734,20.25 39.4211923,20.9571103 39.4941988,21.8564728 L39.5,22 L39.5,36.25 C39.5,39.3517853 37.0439828,41.879937 33.9705557,41.9958479 L33.75,42 L14.25,42 C11.1482147,42 8.62006299,39.5439828 8.50415208,36.4705557 L8.5,36.25 L8.5,22 C8.5,21.0335017 9.28350169,20.25 10.25,20.25 C11.1681734,20.25 11.9211923,20.9571103 11.9941988,21.8564728 L12,22 L12,36.25 C12,37.440864 12.9251616,38.4156449 14.0959512,38.4948092 L14.25,38.5 L33.75,38.5 C34.940864,38.5 35.9156449,37.5748384 35.9948092,36.4040488 L36,36.25 L36,22 C36,21.0335017 36.7835017,20.25 37.75,20.25 Z M23.4989075,6.26787884 L23.6477793,6.25297693 L23.6477793,6.25297693 L23.8225053,6.25140103 L23.8225053,6.25140103 L23.9770074,6.26441014 L23.9770074,6.26441014 L24.1549097,6.29667263 L24.1549097,6.29667263 L24.223898,6.31492315 L24.223898,6.31492315 C24.4192207,6.36884271 24.6069182,6.4577966 24.7773762,6.58126437 L24.8968901,6.67628678 L24.8968901,6.67628678 L24.989825,6.76256313 L32.7679996,14.5407377 C33.4514171,15.2241552 33.4514171,16.3321939 32.7679996,17.0156115 C32.1247831,17.6588279 31.1054316,17.6966642 30.4179639,17.1291203 L30.2931259,17.0156115 L25.5,12.222 L25.5,31.5 C25.5,32.4181734 24.7928897,33.1711923 23.8935272,33.2441988 L23.75,33.25 C22.8318266,33.25 22.0788077,32.5428897 22.0058012,31.6435272 L22,31.5 L22,12.226 L17.2116504,17.0156115 C16.5684339,17.6588279 15.5490824,17.6966642 14.8616148,17.1291203 L14.7367767,17.0156115 C14.0935602,16.372395 14.055724,15.3530435 14.6232679,14.6655758 L14.7367767,14.5407377 L22.488804,6.78678454 C22.5446792,6.72871358 22.6045271,6.67449255 22.6679103,6.62455868 L22.7812362,6.54379243 L22.7812362,6.54379243 C22.8189499,6.51724 22.858413,6.49312256 22.8988638,6.47056335 L22.9176605,6.46138558 C23.0947495,6.36422067 23.2909216,6.29776289 23.4989075,6.26787884 Z"></path>
                </g>
              </g>
            </g>
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
      <div className="flex items-center">
          <div className="flex items-center space-x-2 ml-1">
            <img
              src="https://i.pinimg.com/736x/e6/33/1a/e6331a2ab6e00204cbd1e3e2a83abe8c.jpg"
              alt="Outdoor Cycle Logo"
              className="w-12 h-12 rounded-lg"
            />
          </div>
          <div className="flex flex-col ml-3 h-12 justify-between">
          <span className="text-white text-sm font-bold">Outdoor Cycle</span>
          <span className="text-gray-400 text-xs">16:47 - 16:59</span>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 space-y-2">
          <h3 className="text-white font-semibold">Workout Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">Workout Time</p>
              <p className="text-white text-lg font-semibold" style={{ color: "#8eed45" }}>00:12:26</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Distance</p>
              <div className="flex items-center">
                <p className="text-lg font-bold text-sky-400">1.95</p>
                <span className="text-sm font-bold text-sky-400 mt-0.5">KM</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Active Kilocalories</p>
              <div className="flex items-center">
                <p className="text-lg font-bold text-pink-500">211</p>
                <span className="text-sm font-bold text-pink-500 mt-0.5">KCAL</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Kilocalories</p>
              <div className="flex items-center">
                <p className="text-lg font-bold text-pink-500">211</p>
                <span className="text-sm font-bold text-pink-500 mt-0.5">KCAL</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Speed</p>
              <div className="flex items-center">
                <p className="text-cyan-300 text-lg font-semibold">9.4</p>
                <span className="text-sm font-bold text-cyan-300 mt-0.5">KM/H</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Heart Rate</p>
              <div className="flex items-center">
                <p className="text-red-500 text-lg font-semibold">82</p>
                <span className="text-sm font-bold text-red-500 mt-0.5">BPM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Heart Rate</h3>
            <button className="text-lime-500 text-xs font-semibold">
              Show More
            </button>
          </div>
          {/* Real Line Chart for Heart Rate */}
          <div className="h-16 bg-black">
            <Line data={chartData} options={chartOptions} />
          </div>
          <p className="text-xs mt-1" style={{ color: "red" }}>82 BPM AVG</p>
        </div>
      </div>

      <footer className="px-4 py-3 border-t border-gray-700">
        <p className="text-center text-xs text-gray-500">
          Updated a few seconds ago
        </p>
      </footer>
    </motion.div>
  );
};

/* ---------------------------------------------
   WorkoutsSection Component (Original Workouts Section)
--------------------------------------------- */
const WorkoutsSection: React.FC<{ onOutdoorCycleClick: () => void }> = ({
  onOutdoorCycleClick,
}) => {
  const [showMore, setShowMore] = useState(false);

  const WhiteArrow = () => (
    <svg
      className="w-3 h-6"
      viewBox="0 0 8 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 2L6 8L2 14"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <section className="mt-4 space-y-3">
      <div className="flex justify-between items-center px-3">
        <h3 className="text-white text-lg font-semibold">Workouts</h3>
        <button
          onClick={() => setShowMore(!showMore)}
          className="text-lime-500 text-sm font-semibold"
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
      </div>
      <div className="space-y-2 px-1">
        {/* Outdoor Cycle Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="w-full flex items-center bg-gray-800 p-3 rounded-xl h-16 cursor-pointer"
          onClick={onOutdoorCycleClick}
        >
          <img
            src="https://i.pinimg.com/736x/e6/33/1a/e6331a2ab6e00204cbd1e3e2a83abe8c.jpg"
            alt="Outdoor Cycle Logo"
            className="w-6 h-6 rounded-sm mr-3"
          />
          <div className="flex-1">
            <p className="text-white font-bold">Outdoor Cycle</p>
            <p className="text-xs text-gray-400">30 min • 2.5 km</p>
          </div>
          <WhiteArrow />
        </motion.div>
        <AnimatePresence>
          {showMore && (
            <>
              <motion.div
                key="card2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="w-full flex items-center bg-gray-800 p-3 rounded-xl h-16 cursor-pointer"
              >
                <img
                  src="https://i.pinimg.com/736x/28/82/ce/2882ce2c3292b6e7e5c0f04793e273bb.jpg"
                  alt="Evening Run Logo"
                  className="w-6 h-6 rounded-sm mr-3"
                />
                <div className="flex-1">
                  <p className="text-white font-bold">Evening Run</p>
                  <p className="text-xs text-gray-400">25 min • 3.0 km</p>
                </div>
                <WhiteArrow />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ---------------------------------------------
   ActivitySummary Component (Conditional Rendering)
--------------------------------------------- */
const ActivitySummary: React.FC = () => {
  const [view, setView] = useState<"summary" | "outdoorCycle">("summary");

  return (
    <AnimatePresence>
      {view === "summary" ? (
        <motion.div
          key="summary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col"
        >
          <header className="px-3 pt-6 pb-2 border-b border-gray-700">
            <p className="text-gray-400 text-[10px]">TUESDAY 14 FEB</p>
            <div className="flex items-center justify-between">
              <h1 className="text-white text-2xl font-bold">Summary</h1>
              <img
                src="https://i.pinimg.com/736x/a3/42/a5/a342a5261e23a03fdfa88be4c793e27e.jpg"
                alt="Profile"
                className="w-8 h-8 rounded-full border border-white"
              />
            </div>
          </header>
          <div className="p-3 flex-1 overflow-y-auto overflow-x-hidden space-y-3">
            <p className="text-white text-lg font-bold">Activity</p>
            <div className="space-y-1">
              <div className="bg-gray-800 rounded-t-xl">
                <ActivityRingsCard />
              </div>
              <div className="h-[1.5px] bg-black" />
              <div className="bg-gray-800 rounded-b-xl">
                <StatsCard />
              </div>
            </div>
            <WorkoutsSection onOutdoorCycleClick={() => setView("outdoorCycle")} />
          </div>
          <footer className="px-3 py-2 border-t border-gray-700">
            <p className="text-center text-xs text-gray-500">
              Updated 5 minutes ago
            </p>
          </footer>
        </motion.div>
      ) : (
        <OutdoorCycleDetail onBack={() => setView("summary")} />
      )}
    </AnimatePresence>
  );
};

/* ---------------------------------------------
   Page Export with SF Pro Font (This Page Only)
--------------------------------------------- */
export default function ActivitySummaryPage() {
  return (
    <>
      <style jsx>{`
        @font-face {
          font-family: "SF Pro";
          src: url("/fonts/SFProDisplay-Regular.otf") format("opentype");
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: "SF Pro";
          src: url("/fonts/SFProDisplay-Bold.otf") format("opentype");
          font-weight: 700;
          font-style: normal;
        }
        .sf-pro {
          font-family: "SF Pro", sans-serif;
        }
      `}</style>
      <div className="min-h-screen bg-gray-300 flex justify-center items-center p-3 sf-pro relative">
        <div className="w-[350px] h-[640px] bg-black rounded-3xl border border-gray-800 shadow-xl overflow-hidden px-2 relative">
          <ActivitySummary/>
        </div>
      </div>
    </>
  );
} 