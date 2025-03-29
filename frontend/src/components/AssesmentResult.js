import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const handleStartLearning = () => {
    navigate('/dyslexia-learning');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userID = localStorage.getItem("userId") || "unknown_user";

        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/assessmentresult`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userID })
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        const transformedData = {
          ...result,
          preferredLearningStyle: result.preferredLearningStyle || [],
          learningDisabilities: result.learningDisabilities || [],
          emotionAnalysis: {
            ...result.emotionAnalysis,
            graphData: Object.entries(result.emotionAnalysis.emotionOccurrences).map(([emotion, count]) => ({
              emotion,
              count
            }))
          }
        };

        setData(transformedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching assessment data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions
  const getDisabilityColor = (name) => {
    if (name === 'Dyslexia') return '#3B82F6';
    if (name === 'Dysgraphia') return '#8B5CF6';
    return '#10B981';
  };

  const getRecommendations = (ldType) => {
    const recommendations = {
      'Dyslexia': [
        'Use text-to-speech software for reading tasks',
        'Provide extra time for reading assignments',
        'Use color-coded reading materials',
        'Break reading into smaller chunks',
        'Use multisensory learning approaches'
      ],
      'Dysgraphia': [
        'Provide alternatives to handwriting (typing, speech-to-text)',
        'Use graph paper for math problems to help with alignment',
        'Allow extra time for writing assignments',
        'Use specialized grips for writing tools',
        'Break writing tasks into smaller components'
      ],
      'Dyscalculia': [
        'Use visual aids for math concepts',
        'Provide number lines and multiplication charts',
        'Allow use of calculators when focus is on concepts not calculation',
        'Use manipulatives and hands-on materials',
        'Connect math to real-life examples'
      ]
    };
    
    return recommendations[ldType] || [];
  };

  // Custom chart components
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-sm">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p>{`Score: ${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-red-500 text-center mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Unable to Load Data</h2>
          <p className="text-slate-600 text-center mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <p className="text-slate-600">No assessment data available.</p>
        </div>
      </div>
    );
  }

  // Format data for charts
  const ldScores = data.learningDisabilities.map(ld => ({
    name: ld.type,
    score: ld.confidenceScore * 100
  }));

  // Get primary LD (highest confidence score)
  const primaryLD = ldScores.reduce((max, ld) => 
    ld.score > max.score ? ld : max, { name: '', score: 0 }
  );

  // Format emotion data
  const emotionData = data.emotionAnalysis.graphData;
  const totalEmotions = emotionData.reduce((sum, item) => sum + item.count, 0);
  const EMOTION_COLORS = ['#6366F1', '#F87171', '#FBBF24', '#34D399'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-indigo-600 text-xl font-bold">LearningAI</span>
              </div>
            </div>
            <div className="flex items-center">
              <button 
                onClick={handleStartLearning}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Learning Plan
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <header className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 py-10 text-white">
              <h1 className="text-3xl font-bold mb-2">Learning Assessment Dashboard</h1>
              <p className="text-indigo-100 max-w-xl">
                Personalized AI-powered assessment results for {data.name}'s student
              </p>
              
              <div className="mt-8 flex flex-wrap gap-6">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg px-4 py-3 flex items-center">
                  <div className="mr-3 p-2 bg-indigo-500 bg-opacity-30 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200">Primary Challenge</div>
                    <div className="font-bold">{primaryLD.name}</div>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg px-4 py-3 flex items-center">
                  <div className="mr-3 p-2 bg-indigo-500 bg-opacity-30 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200">Learning Style</div>
                    <div className="font-bold">{data.preferredLearningStyle.join(', ')}</div>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg px-4 py-3 flex items-center">
                  <div className="mr-3 p-2 bg-indigo-500 bg-opacity-30 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200">Student Age</div>
                    <div className="font-bold">{data.age} years</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('disabilities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'disabilities'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Learning Disabilities
            </button>
            <button
              onClick={() => setActiveTab('emotions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'emotions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Emotional Analysis
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recommendations
            </button>
          </nav>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Summary Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Assessment Summary</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Parent/Guardian</h3>
                    <p className="mt-1 text-base font-medium">{data.name}</p>
                    <p className="text-sm text-gray-600">{data.relationship}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Student</h3>
                    <p className="mt-1 text-base font-medium">{data.age} years old</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {data.preferredLearningStyle.map(style => (
                        <span key={style} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Assessment Date</h3>
                    <p className="mt-1 text-sm text-gray-600">March 15, 2025</p>
                  </div>
                </div>
              </div>
              
              {/* Primary Challenge Card */}
              <div className="bg-white rounded-xl shadow-md p-6 col-span-2">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Primary Learning Challenge</h2>
                
                <div className="flex items-center">
                  <div 
                    className="mr-4 h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: getDisabilityColor(primaryLD.name) }}
                  >
                    {primaryLD.name.charAt(0)}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{primaryLD.name}</h3>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-xs">
                        <div 
                          className="h-2.5 rounded-full" 
                          style={{ 
                            width: `${primaryLD.score}%`,
                            backgroundColor: getDisabilityColor(primaryLD.name)
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{primaryLD.score.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Indicators:</h4>
                  <ul className="space-y-2">
                    {data.learningDisabilities
                      .find(ld => ld.type === primaryLD.name)?.indicators
                      .slice(0, 3)
                      .map((indicator, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">{indicator}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* LD Score Comparison */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Learning Disabilities Assessment</h2>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ldScores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {ldScores.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getDisabilityColor(entry.name)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Emotional Analysis Preview */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Emotional Analysis</h2>
                <button 
                  onClick={() => setActiveTab('emotions')}
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  View Details
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {data.emotionAnalysis.dominantEmotions.map((emotion) => (
                  <div key={emotion} className="bg-gray-100 px-4 py-3 rounded-lg text-center">
                    <div className="text-base font-medium">{emotion}</div>
                    <div className="text-sm text-gray-600">
                      {Math.round((data.emotionAnalysis.emotionOccurrences[emotion] / totalEmotions) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Learning Disabilities Tab Content */}
        {activeTab === 'disabilities' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {data.learningDisabilities.map(ld => (
                <div key={ld.type} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div 
                    className="p-4 text-white font-medium"
                    style={{ backgroundColor: getDisabilityColor(ld.type) }}
                  >
                    <h3 className="text-xl font-bold">{ld.type}</h3>
                    <p className="text-sm opacity-80">Confidence Score: {(ld.confidenceScore * 100).toFixed(1)}%</p>
                  </div>
                  
                  <div className="p-5">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Key Indicators:</h4>
                    <ul className="space-y-2">
                      {ld.indicators.map((indicator, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Comparative Analysis</h2>
              
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={150} data={ldScores}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.5} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-sm text-blue-800 mb-2">Expert Insight</h3>
                <p className="text-sm text-blue-700">
                  The radar chart above shows the comparative strengths of each learning disability indicator. 
                  While {primaryLD.name} is the primary concern, each area requires personalized attention 
                  in your student's learning plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Emotional Analysis Tab Content */}
        {activeTab === 'emotions' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Emotional State During Assessment</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {data.emotionAnalysis.dominantEmotions.map((emotion) => (
                    <div key={emotion} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800">{emotion}</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        Frequency: {Math.round((data.emotionAnalysis.emotionOccurrences[emotion] / totalEmotions) * 100)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="h-2 rounded-full bg-indigo-500" 
                          style={{ width: `${Math.round((data.emotionAnalysis.emotionOccurrences[emotion] / totalEmotions) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <h3 className="font-medium text-sm text-amber-800 mb-2">What This Means</h3>
                  <p className="text-sm text-amber-700">
                    The prevalence of frustration during the assessment may indicate challenges with 
                    learning tasks. This emotional pattern is common for students with learning disabilities
                    and helps inform our personalized learning approach.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Emotion Distribution</h2>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={emotionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="emotion"
                      >
                        {emotionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center gap-6 mt-4">
                  {emotionData.map((item, index) => (
                    <div key={item.emotion} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: EMOTION_COLORS[index % EMOTION_COLORS.length] }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.emotion}: {item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Emotional Support Strategies</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-md text-indigo-800 mb-2">Emotional Regulation</h3>
                  <p className="text-sm text-indigo-700">
                    Teach self-calming techniques to manage frustration during challenging learning tasks.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-md text-green-800 mb-2">Positive Reinforcement</h3>
                  <p className="text-sm text-green-700">
                    Celebrate small victories and progress to build confidence and maintain motivation.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-md text-purple-800 mb-2">Structured Learning</h3>
                  <p className="text-sm text-purple-700">
                    Provide clear expectations and routines to reduce anxiety and create a sense of security.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">AI Analysis Notes</h3>
                <p className="text-sm text-gray-700">
                  {data.emotionAnalysis.analysisNotes || "The emotional analysis indicates a pattern commonly seen in students with learning disabilities. The frustration and anxiety observed suggest that your student may benefit from a combination of emotional support strategies alongside specific learning accommodations. Our AI-powered learning plan will incorporate these emotional factors to create a more holistic approach."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab Content */}
        {activeTab === 'recommendations' && (
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Personalized Recommendations</h2>
              
              <div className="space-y-4">
                {data.learningDisabilities.map(ld => (
                  <div key={ld.type} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="px-4 py-3 font-medium flex items-center justify-between"
                      style={{ backgroundColor: `${getDisabilityColor(ld.type)}20` }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3"
                          style={{ backgroundColor: getDisabilityColor(ld.type) }}
                        >
                          {ld.type.charAt(0)}
                        </div>
                        <span className="font-semibold" style={{ color: getDisabilityColor(ld.type) }}>{ld.type} Support Strategies</span>
                      </div>
                      <div className="text-sm" style={{ color: getDisabilityColor(ld.type) }}>
                        {(ld.confidenceScore * 100).toFixed(1)}% Confidence
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <ul className="space-y-2">
                        {getRecommendations(ld.type).map((rec, idx) => (
                          <li key={idx} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Learning Environment</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Minimize Distractions</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Create a quiet, organized workspace with minimal visual and auditory distractions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Consistent Routine</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Establish a predictable daily schedule for learning activities and breaks.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Multisensory Approach</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Incorporate visual, auditory, and hands-on learning methods to reinforce concepts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Technology Tools</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-full flex-shrink-0 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Text-to-Speech Software</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Use read-aloud tools to support reading comprehension and reduce cognitive load.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-full flex-shrink-0 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Speech-to-Text Tools</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Enable dictation for writing assignments to bypass handwriting challenges.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-full flex-shrink-0 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Visual Learning Apps</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Utilize graphic organizers and mind-mapping software to organize information visually.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Start Your Personalized Learning Plan</h2>
                <button 
                  onClick={handleStartLearning}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Begin Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-indigo-800">AI-Powered Learning Experience</h3>
                    <p className="text-sm text-indigo-700 mt-2">
                      Based on your assessment results, our AI has created a customized learning plan for your student. 
                      This plan includes targeted activities, tools, and strategies specifically designed for 
                      {primaryLD.name.toLowerCase()} support, while incorporating your student's preferred {data.preferredLearningStyle.join(' and ')} learning style(s).
                    </p>
                    <p className="text-sm text-indigo-700 mt-2">
                      The plan adapts as your student progresses, offering just the right level of challenge to 
                      build skills while maintaining confidence and engagement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;