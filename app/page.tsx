"use client";
import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale);

interface ProfileData {
  firstName?: string;
  lastName?: string;
  headline?: string;
  geo?: { full: string };
  profilePicture?: string;
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
  const [postsData, setPostsData] = useState<Post[] | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleArray = Array.from({ length: 12 }, (_, i) => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animation: `float${i % 5} 6s ease-in-out infinite alternate`,
    }));
    setParticles(particleArray);
  }, []);

  const evaluateProfile = async () => {
    if (!profileUrl) {
      setError("Please enter a valid LinkedIn profile URL.");
      return;
    }

    setLoading(true);
    setError("");
    setProfileData(null);
    setPostsData(null);
    setEvaluation(null);

    try {
      const profileResponse = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl }),
      });

      const profileResult = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profileResult.error || "Failed to fetch profile data");

      setProfileData(profileResult.profileData);
      setPostsData(profileResult.postsData);

      const evaluationResponse = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileData: profileResult.profileData, postsData: profileResult.postsData }),
      });

      const evaluationResult = await evaluationResponse.json();
      if (!evaluationResponse.ok) throw new Error(evaluationResult.error || "Failed to evaluate profile");

      setEvaluation(evaluationResult.evaluation);
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
    <div className="relative flex flex-col items-center min-h-screen text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-gray-900 opacity-80 animate-gradient"></div>

        {/* Floating Particles */}
        {particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((particle, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", delay: i * 0.6 }}
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

      {/* Hero Section */}
      <motion.section initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center py-20 relative z-10">
        <h1 className="text-5xl font-extrabold tracking-wide text-blue-400">LinkedIn Profile Evaluator</h1>
        <p className="text-lg text-gray-300 mt-3">Get AI-powered insights on your LinkedIn profile and posts.</p>
      </motion.section>

      {/* Evaluator Card */}
      <section id="evaluator" className="relative w-full max-w-md p-6 bg-white bg-opacity-10 rounded-lg shadow-lg backdrop-blur-md">
        <h2 className="text-center text-2xl font-semibold">Enter Profile URL</h2>
        <input type="text" value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="Paste LinkedIn URL here..." className="w-full p-3 mt-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <button onClick={evaluateProfile} disabled={loading} className="w-full mt-4 py-3 bg-blue-600 rounded-lg text-lg font-bold hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Evaluating..." : "Evaluate"}
        </button>
        {error && <p className="text-red-400 text-center mt-2">{error}</p>}
      </section>

      {/* Evaluation Results */}
      {evaluation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="mt-10 w-full max-w-lg p-6 bg-gray-800 rounded-lg z-10">
          <h3 className="text-center text-lg font-semibold text-blue-300">Gemini AI Evaluation</h3>
          <p className="text-center text-lg font-bold text-gray-300">{evaluation.overallRemark}</p>

          {/* Overall Score Chart */}
          <div className="w-40 h-40 mx-auto mt-4">
            <Doughnut data={generateChartData(evaluation.overallScore, 100, "#2196F3")} />
          </div>
          <p className="text-center font-bold">{evaluation.overallScore} / 100</p>

          {/* Individual Section Charts */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {Object.entries(evaluation).map(([key, value]) => {
              if (key === "overallScore" || key === "overallRemark") return null;
              const category = value as EvaluationCategory;
              return (
                <div key={key} className="p-4 bg-gray-700 rounded-lg text-center">
                  <h4 className="font-semibold text-white">{key}</h4>
                  <div className="w-32 h-32 mx-auto">
                    <Doughnut data={generateChartData(category.score, 10, "#4caf50")} />
                  </div>
                  <p className="text-gray-300 mt-2">{category.text}</p>

                  {key === "Posts" && evaluation.Posts.topPosts.length > 0 && (
                    <div className="mt-4 text-left">
                      <h5 className="font-semibold text-white">Top 3 Posts:</h5>
                      <ul className="text-gray-300 list-disc pl-4">
                        {evaluation.Posts.topPosts.map((post, index) => (
                          <li key={index}>{post}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
