"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Send, Leaf, BarChart3, Thermometer, Droplets, Wind, CloudRain } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { ThemeToggle } from "../ui/theme-toggle";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const initialData = {
  soil_type: "Clay",
  soil_ph: "6.5",
  temperature: "28.0",
  humidity: "60.0",
  wind_speed: "5.0",
  N: "60.0",
  P: "40.0",
  K: "50.0",
  annual_rainfall: "200.0",
};

export default function AgriMindDashboard() {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    predicted_crop: string;
    confidence: number;
    all_probabilities: Record<string, number>;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("https://fastapi-forcrop.up.railway.app/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soil_type: formData.soil_type,
          soil_ph: parseFloat(formData.soil_ph),
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          wind_speed: parseFloat(formData.wind_speed),
          N: parseFloat(formData.N),
          P: parseFloat(formData.P),
          K: parseFloat(formData.K),
          annual_rainfall: parseFloat(formData.annual_rainfall),
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error submitting data:", error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-slate-900 dark:to-green-900 p-4 lg:p-6 transition-colors duration-300">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="text-center mb-8"
      >
        <motion.div variants={staggerItem} className="flex items-center justify-center gap-3 mb-3">
          <motion.div 
            className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full transition-all duration-300"
            whileHover={{ scale: 1.05, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
          >
            <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <motion.h1 
            variants={staggerItem}
            className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent pb-2"
          >
            AgriMind Dashboard
          </motion.h1>
        </motion.div>
        <motion.p 
          variants={staggerItem}
          className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto transition-colors"
        >
          Advanced soil analysis and crop recommendation system powered by AI
        </motion.p>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Form Section - Left Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg transition-all duration-300 hover:shadow-2xl hover:bg-white/90 dark:hover:bg-gray-800/90">
                <CardContent className="p-6">
                  <motion.div 
                    className="flex items-center gap-2 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Soil Analysis</h2>
                  </motion.div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Quick Stats */}
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-all duration-300"
                  >
                    <motion.div 
                      variants={staggerItem}
                      className="text-center group cursor-pointer"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-105 transition-transform">
                        <Thermometer className="h-4 w-4" />
                        <span className="text-sm font-medium">Temp</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{formData.temperature}°C</p>
                    </motion.div>
                    <motion.div 
                      variants={staggerItem}
                      className="text-center group cursor-pointer"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-105 transition-transform">
                        <Droplets className="h-4 w-4" />
                        <span className="text-sm font-medium">Humidity</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{formData.humidity}%</p>
                    </motion.div>
                  </motion.div>

                  {/* Soil Chemistry Section */}
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    <motion.div variants={staggerItem} className="flex items-center gap-2">
                      <motion.div 
                        className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      ></motion.div>
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Soil Chemistry</h3>
                    </motion.div>
                    
                    <motion.div variants={staggerItem} className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <span>Soil Type</span>
                        <Badge variant="outline" className="text-xs">{formData.soil_type}</Badge>
                      </label>
                      <select 
                        name="soil_type" 
                        value={formData.soil_type} 
                        onChange={handleChange}
                        title="Select soil type"
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-gray-100 shadow-sm transition-all duration-300 hover:shadow-md focus:shadow-lg"
                      >
                        <option value="Clay">Clay</option>
                        <option value="Sandy">Sandy</option>
                        <option value="Loamy">Loamy</option>
                      </select>
                    </motion.div>
                    
                    <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
                      <FormField 
                        label="pH Level" 
                        unit="0-14" 
                        name="soil_ph" 
                        value={formData.soil_ph} 
                        onChange={handleChange} 
                      />
                      <FormField 
                        label="Nitrogen (N)" 
                        unit="mg/kg" 
                        name="N" 
                        value={formData.N} 
                        onChange={handleChange} 
                      />
                    </motion.div>
                    <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
                      <FormField 
                        label="Phosphorus (P)" 
                        unit="mg/kg" 
                        name="P" 
                        value={formData.P} 
                        onChange={handleChange} 
                      />
                      <FormField 
                        label="Potassium (K)" 
                        unit="mg/kg" 
                        name="K" 
                        value={formData.K} 
                        onChange={handleChange} 
                      />
                    </motion.div>
                  </motion.div>

                  <Separator />

                  {/* Environmental Conditions Section */}
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    <motion.div variants={staggerItem} className="flex items-center gap-2">
                      <motion.div 
                        className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      ></motion.div>
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Environmental Conditions</h3>
                    </motion.div>
                    
                    <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
                      <FormField 
                        label="Temperature" 
                        unit="°C" 
                        name="temperature" 
                        value={formData.temperature} 
                        onChange={handleChange}
                        icon={<Thermometer className="h-4 w-4 text-orange-500" />}
                      />
                      <FormField 
                        label="Humidity" 
                        unit="%" 
                        name="humidity" 
                        value={formData.humidity} 
                        onChange={handleChange}
                        icon={<Droplets className="h-4 w-4 text-blue-500" />}
                      />
                    </motion.div>
                    <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
                      <FormField 
                        label="Wind Speed" 
                        unit="m/s" 
                        name="wind_speed" 
                        value={formData.wind_speed} 
                        onChange={handleChange}
                        icon={<Wind className="h-4 w-4 text-gray-500" />}
                      />
                      <FormField 
                        label="Rainfall" 
                        unit="mm" 
                        name="annual_rainfall" 
                        value={formData.annual_rainfall} 
                        onChange={handleChange}
                        icon={<CloudRain className="h-4 w-4 text-blue-600" />}
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="pt-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white py-3 text-lg font-medium shadow-lg transition-all duration-300 hover:shadow-xl rounded-xl group"
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Leaf className="h-5 w-5" />
                          </motion.div>
                        ) : (
                          <motion.div
                            className="mr-2"
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </motion.div>
                        )}
                        {isSubmitting ? "Analyzing Soil..." : "Analyze & Predict"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Results Section - Right Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-7"
          >
            {result ? (
              <div className="space-y-6">
                {/* Main Prediction Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg transition-all duration-300 hover:shadow-2xl hover:bg-white/90 dark:hover:bg-gray-800/90">
                    <CardContent className="p-6">
                      <motion.div 
                        className="flex items-center justify-between mb-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Crop Recommendation</h2>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 25 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/50">
                            AI Prediction
                          </Badge>
                        </motion.div>
                      </motion.div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div 
                        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700/50 transition-all duration-300 group cursor-pointer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div 
                            className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full"
                            whileHover={{ rotate: 10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </motion.div>
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Recommended Crop</p>
                            <motion.p 
                              className="text-3xl font-bold text-green-700 dark:text-green-300"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
                            >
                              {result.predicted_crop}
                            </motion.p>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700/50 transition-all duration-300 group cursor-pointer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div 
                            className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-full"
                            whileHover={{ rotate: -10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </motion.div>
                          <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Confidence Level</p>
                            <motion.p 
                              className="text-3xl font-bold text-blue-700 dark:text-blue-300"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 25 }}
                            >
                              {(result.confidence * 100).toFixed(1)}%
                            </motion.p>
                          </div>
                        </div>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                          className="origin-left"
                        >
                          <Progress 
                            value={result.confidence * 100} 
                            className="h-3 bg-blue-100 dark:bg-blue-800/30 rounded-full" 
                          />
                        </motion.div>
                      </motion.div>
                    </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Chart Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  whileHover={{ y: -3 }}
                >
                  <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg transition-all duration-300 hover:shadow-2xl hover:bg-white/90 dark:hover:bg-gray-800/90">
                    <CardContent className="p-6">
                      <motion.div 
                        className="flex items-center gap-2 mb-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <BarChart3 className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Probability Analysis</h3>
                      </motion.div>
                    <div className="h-80 lg:h-96">
                      <Bar
                        data={{
                          labels: Object.keys(result.all_probabilities),
                          datasets: [
                            {
                              label: "Probability (%)",
                              data: Object.values(result.all_probabilities).map((p) => +((p as number) * 100).toFixed(2)),
                              backgroundColor: Object.keys(result.all_probabilities).map(
                                (crop) => (crop === result.predicted_crop 
                                  ? "rgba(34, 197, 94, 0.8)" 
                                  : "rgba(59, 130, 246, 0.6)")
                              ),
                              borderColor: Object.keys(result.all_probabilities).map(
                                (crop) => (crop === result.predicted_crop 
                                  ? "rgba(34, 197, 94, 1)" 
                                  : "rgba(59, 130, 246, 0.8)")
                              ),
                              borderWidth: 2,
                              borderRadius: 8,
                              borderSkipped: false,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.9)',
                              titleColor: 'white',
                              bodyColor: 'white',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              borderWidth: 1,
                              cornerRadius: 8,
                              callbacks: {
                                label: (ctx) => `Probability: ${ctx.parsed.y}%`,
                                title: (ctx) => `${ctx[0].label} Crop`,
                              },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: { 
                                callback: (val) => val + "%",
                                color: '#6B7280',
                              },
                              grid: {
                                color: "rgba(107, 114, 128, 0.1)",
                              },
                            },
                            x: {
                              ticks: {
                                color: '#6B7280',
                                maxRotation: 45,
                              },
                              grid: {
                                display: false,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Additional Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  whileHover={{ y: -3 }}
                >
                  <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg transition-all duration-300 hover:shadow-2xl hover:bg-white/90 dark:hover:bg-gray-800/90">
                    <CardContent className="p-6">
                      <motion.h3 
                        className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                      >
                        Analysis Insights
                      </motion.h3>
                    <motion.div 
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="grid md:grid-cols-3 gap-4"
                    >
                      <motion.div 
                        variants={staggerItem}
                        className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-all duration-300 hover:shadow-md group cursor-pointer"
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Soil Suitability</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {result.confidence > 0.8 ? 'Excellent' : result.confidence > 0.6 ? 'Good' : 'Fair'}
                        </p>
                      </motion.div>
                      <motion.div 
                        variants={staggerItem}
                        className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-all duration-300 hover:shadow-md group cursor-pointer"
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Risk Level</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {result.confidence > 0.7 ? 'Low' : result.confidence > 0.5 ? 'Medium' : 'High'}
                        </p>
                      </motion.div>
                      <motion.div 
                        variants={staggerItem}
                        className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-all duration-300 hover:shadow-md group cursor-pointer"
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Alternatives</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {Object.keys(result.all_probabilities).length - 1}
                        </p>
                      </motion.div>
                    </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            ) : (
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg h-full transition-all duration-300 hover:shadow-2xl hover:bg-white/90 dark:hover:bg-gray-800/90">
                  <CardContent className="p-6 h-full flex items-center justify-center">
                  <motion.div 
                    className="text-center text-gray-500 dark:text-gray-400 max-w-md"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      variants={staggerItem}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="mb-6"
                    >
                      <motion.div 
                        className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800/30 dark:to-blue-800/30 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-lg cursor-pointer"
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        >
                          <Leaf className="h-12 w-12 text-green-500 dark:text-green-400" />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                    <motion.h3 
                      variants={staggerItem}
                      className="text-2xl font-semibold mb-3 text-gray-700 dark:text-gray-200"
                    >
                      Ready for Analysis
                    </motion.h3>
                    <motion.p 
                      variants={staggerItem}
                      className="text-gray-500 dark:text-gray-400 leading-relaxed"
                    >
                      Complete the soil analysis form to receive AI-powered crop recommendations 
                      tailored to your specific conditions.
                    </motion.p>
                  </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  unit: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
};

const FormField = ({ label, unit, name, value, onChange, icon }: FormFieldProps) => {
  return (
    <motion.div 
      className="space-y-2 group"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2 transition-colors group-hover:text-green-600 dark:group-hover:text-green-400">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {icon}
        </motion.div>
        <span>{label}</span>
        <Badge variant="secondary" className="text-xs transition-colors group-hover:bg-green-100 dark:group-hover:bg-green-900/50">{unit}</Badge>
      </label>
      <motion.input 
        type="number" 
        step="0.1"
        name={name} 
        value={value} 
        onChange={onChange}
        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-gray-100 shadow-sm transition-all duration-300 hover:shadow-md focus:shadow-lg hover:border-green-300 dark:hover:border-green-600"
        placeholder={`Enter ${label.toLowerCase()}`}
        whileFocus={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </motion.div>
  );
};
