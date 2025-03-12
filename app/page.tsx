"use client";
import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Footer from "./components/Footer";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
} from "chart.js";
import SignInAlert from "./components/SignInAlert";
import { useCredits } from "@/app/contexts/CreditsContext";

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale);

interface ProfileData {
  firstName?: string;
  lastName?: string;
  headline?: string;
  geo?: { full: string };
  profilePicture?: string;
  fullPositions?: { companyName: string; companyURL?: string; companyLogo?: string }[];
  educations?: { fieldOfStudy?: string; degree?: string; start?: any; end?: any }[];
  skills?: { name: string; passedSkillAssessment: boolean }[];
  certifications?: { name: string; authority?: string }[];
}

interface Post {
  id: string;
  text: string;
  likes: number;
  comments: number;
  shares: number;
}

interface EvaluationCategory {
  text: string;
  score: number;
}

interface Evaluation {
  overallScore: number;
  overallRemark: string;
  Headline: EvaluationCategory;
  Summary: EvaluationCategory;
  Experience: EvaluationCategory;
  Education: EvaluationCategory;
  Other: EvaluationCategory;
  Posts: { text: string; score: number; topPosts: string[] };
}

interface Particle {
  top: string;
  left: string;
  animation: string;
}

export default function Home() {
  const [profileUrl, setProfileUrl] = useState("");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  // const [postsData, setPostsData] = useState<Post[] | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [loadingText, setLoadingText] = useState("Getting your data");
  const { data: session } = useSession();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { credits, fetchCredits } = useCredits();
  // Create floating particles on mount
  useEffect(() => {
    const particleArray = Array.from({ length: 12 }, (_, i) => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animation: `float${i % 5} 6s ease-in-out infinite alternate`,
    }));
    setParticles(particleArray);
  }, []);

  // Animated loading text effect
  useEffect(() => {
    if (!loading) return;
    const texts = [
      "Getting your data",
      "Doing the AI magic",
      "Scanning your profile",
      "Analyzing engagement",
      "Gathering insights",
      "Almost done",
      "Optimizing for success",
    ];
    let count = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[count % texts.length] + ".".repeat((count % 3) + 1));
      count++;
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const evaluateProfile = async () => {
    if (!session) {
      setIsEditOpen(true);
      return;
    }
    if (!profileUrl) {
      setError("Please enter a valid LinkedIn profile URL.");
      return;
    }

    // Step 0: Check credits before evaluation
    try {
      if (!credits || credits <= 0) {
        toast.error("You have run out of credits. Contact me for more.");
        setError("");
        return;
      }
    } catch (err) {
      setError("Error checking credits. "+err);
      return;
    }

    setLoading(true);
    setError("");
    setProfileData(null);
    // setPostsData(null);
    setEvaluation(null);

    try {
      // Step 1: Fetch LinkedIn profile and posts data
      const profileResponse = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl }),
      });
      const profileResult = await profileResponse.json();
      if (!profileResponse.ok || !profileResult.profileData)
        throw new Error(profileResult.error || "Failed to fetch profile data");

      setProfileData(profileResult.profileData);
      // setPostsData(profileResult.postsData);

      // Step 2: Evaluate the profile using both profileData and postsData
      const evaluationResponse = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileData: profileResult.profileData,
          postsData: profileResult.postsData,
        }),
      });
      const evaluationResult = await evaluationResponse.json();
      if (!evaluationResponse.ok || !evaluationResult.evaluation)
        throw new Error(evaluationResult.error || "Failed to evaluate profile");

      setEvaluation(evaluationResult.evaluation);

      // Step 3: Decrement credits after successful evaluation
      const decrementResponse = await fetch("/api/credits/decrement", {
        method: "POST",
      });
      const decrementResult = await decrementResponse.json();
      if (!decrementResponse.ok) {
        setError(decrementResult.error || "Failed to decrement credits");
      }
       // Refresh credits from the server
      await fetchCredits();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (score: number, maxScore: number, color: string) => ({
    labels: [`Score: ${score}`, `Remaining: ${maxScore - score}`],
    datasets: [
      {
        data: [score, maxScore - score],
        backgroundColor: [color, "#e0e0e0"],
        borderWidth: 0,
      },
    ],
  });

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative select-none">
      <Toaster />
      {/* Animated Background */}
      <div className="absolute inset-0 bg-black pointer-events-none">
        <SignInAlert isOpen={isEditOpen} setIsOpen={setIsEditOpen} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-gray-900 opacity-80 animate-gradient"></div>
        {particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((particle, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: i * 0.6,
                }}
                className="absolute w-6 h-6 bg-blue-500 rounded-full blur-lg"
                style={{
                  top: particle.top,
                  left: particle.left,
                  animation: particle.animation,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-grow relative z-10">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center py-20 px-4"
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-wide text-blue-400">
            LinkedIn Profile Evaluator
          </h1>
          <p className="text-base sm:text-lg text-gray-300 mt-3">
            Get AI-powered insights on your LinkedIn profile and posts.
          </p>
        </motion.section>

        {/* Evaluator Card */}
        <section
          id="evaluator"
          className="relative w-full sm:max-w-md mx-auto p-6 bg-white bg-opacity-10 rounded-lg shadow-lg backdrop-blur-md px-4"
        >
          <h2 className="text-center text-2xl font-semibold">Enter Profile URL</h2>
          <input
            type="text"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="Paste LinkedIn URL here..."
            className="w-full p-3 mt-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={evaluateProfile}
            className={`w-full mt-4 py-3 rounded-lg text-lg font-bold ${
              !session ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {!session ? (
              <span className="flex items-center justify-center gap-2">
                <span>Evaluate</span>
                <img
                  src="https://cdn.pixabay.com/photo/2014/04/02/17/03/safety-307803_960_720.png"
                  alt="lock icon"
                  className="h-5 pb-[2px]"
                />
              </span>
            ) : loading ? (
              loadingText
            ) : (
              "Evaluate (1 credit)"
            )}
          </button>
          {error && <p className="text-red-400 text-center mt-2">{error}</p>}
        </section>

        {/* Profile Details Section */}
        {profileData && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}  // This increases the size by 5% on hover
          transition={{ duration: 0.3 }}
          className="mt-6 w-full sm:max-w-lg mx-auto p-6 bg-gray-800 rounded-lg text-center px-4 cursor-pointer"
        >
          {profileData.profilePicture && (
            <img
              src={profileData.profilePicture}
              alt="Profile"
              className="w-24 h-24 mx-auto rounded-full border-4 border-blue-400 mb-4"
            />
          )}
          <h2 className="text-3xl font-bold">
            {profileData.firstName} {profileData.lastName}
          </h2>
          {profileData.geo?.full && <p className="text-gray-400">{profileData.geo.full}</p>}
          {profileData.headline && <p className="text-gray-300 mt-2">{profileData.headline}</p>}
        </motion.section>
      )}

        {/* Evaluation Results */}
        {evaluation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="mt-10 w-full sm:max-w-lg mx-auto p-6 bg-gray-800 rounded-lg px-4 select-text"
          >
            {/* Overall Score Section */}
            <section className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Overall Score</h2>
              <div className="w-24 h-24 sm:w-40 sm:h-40 mx-auto mt-4">
                <Doughnut data={generateChartData(evaluation.overallScore, 100, "#6513b7")} />
              </div>
              <p className="mt-2 text-lg font-bold text-gray-300">
                {evaluation.overallScore} / 100
              </p>
              <p className="text-lg font-bold text-gray-300 mt-2">{evaluation.overallRemark}</p>
            </section>

            {/* Dropdowns for Individual Sections */}
            <div className="mt-6 space-y-4">
              {Object.entries(evaluation).map(([key, value]) => {
                if (key === "overallScore" || key === "overallRemark") return null;
                const category = value as EvaluationCategory;
                return (
                  <div key={key} className="bg-gray-700 rounded-lg">
                    <button
                      className="w-full text-left flex justify-between items-center p-3 text-white"
                      onClick={() => toggleSection(key)}
                    >
                      <h3 className="text-lg font-semibold">{key}</h3>
                      <span>{openSections[key] ? "▲" : "▼"}</span>
                    </button>
                    <AnimatePresence>
                      {openSections[key] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="p-4 bg-gray-900 rounded-b-lg overflow-hidden"
                        >
                          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                            <Doughnut data={generateChartData(category.score, 10, "#2196F3")} />
                          </div>
                          <p className="text-center text-gray-300 mt-3">{category.text}</p>
                          {key === "Posts" &&
                            evaluation.Posts.topPosts.length > 0 && (
                              <div className="mt-4 text-left">
                                <h5 className="font-semibold text-white">Top 3 Posts:</h5>
                                <ul className="text-gray-300 list-disc pl-4">
                                  {evaluation.Posts.topPosts.map((post, index) => (
                                    <li key={index}>{post}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
