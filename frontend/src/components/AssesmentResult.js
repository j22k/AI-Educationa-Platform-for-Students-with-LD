import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  // Sample data from the provided JSON
  const data = {
    'studentProfile': {
      'userID': 'uniqueID_001',
      'name': 'iusdifu',
      'age': 14,
      'relationship': 'Parent/Guardian',
      'preferredLearningStyle': ['Visual'],
      'strengths': 'dson[i',
      'struggles': 'feohoqi',
      'previousDiagnosis': 'sdlvns',
      'mainConcerns': 'oieinoin',
      'previousSupport': 'oihfoi'
    },
    'learningDisabilities': {
      'Dyslexia': {
        'confidenceScore': 0.85,
        'indicators': [
          'Struggles with spelling and often misspells common words',
          'Difficulty pronouncing new or long words',
          'Difficulty rhyming words',
          'Struggles with recognizing letters or letter sounds',
          'Confuses similar-looking letters',
          'Forgets what they just read',
          'Frequently guesses words instead of sounding them out',
          'Skips words or entire lines while reading',
          'Takes longer than peers to read simple words',
          'Avoids reading aloud or shows anxiety while reading'
        ]
      },
      'Dysgraphia': {
        'confidenceScore': 0.75,
        'indicators': [
          'Avoids writing tasks or takes significantly longer than peers',
          'Struggles with spacing between words or letters',
          'Struggles with forming complete sentences or organizing thoughts on paper',
          'Struggles with holding a pencil properly',
          'Difficulty copying from the board or a book',
          'Trouble remembering how to write certain letters',
          'Writes letters or numbers in reverse',
          'Complains about hand pain or fatigue while writing'
        ]
      },
      'Dyscalculia': {
        'confidenceScore': 0.9,
        'indicators': [
          'Struggles with simple counting or skip numbers while counting',
          'Has trouble understanding basic math symbols',
          'Struggles with recognizing numbers',
          'Mixes up numbers when reading or writing',
          'Has trouble understanding place value',
          'Relies heavily on finger counting for simple math problems',
          'Struggles with mental math or estimating quantities',
          'Struggles with patterns, sequences, or number relationships',
          'Finds it difficult to tell time on an analog clock',
          'Struggles with word problems or multi-step math instructions'
        ]
      }
    },
    'emotionAnalysis': {
      'dominantEmotions': ['Neutral', 'Anger'],
      'emotionOccurrences': {'Neutral': 39, 'Anger': 41},
      'graphData': [
        {'emotion': 'Neutral', 'count': 39},
        {'emotion': 'Anger', 'count': 41}
      ]
    }
  };

  // Format LD scores for chart
  const ldScores = Object.entries(data.learningDisabilities).map(([name, details]) => ({
    name,
    score: details.confidenceScore * 100
  }));

  // Get primary LD (highest confidence score)
  const primaryLD = ldScores.reduce((max, ld) => 
    ld.score > max.score ? ld : max, { name: '', score: 0 }
  );

  // Format emotion data
  const emotionData = data.emotionAnalysis.graphData;
  const totalEmotions = emotionData.reduce((sum, item) => sum + item.count, 0);
  const EMOTION_COLORS = ['#4F46E5', '#EF4444'];

  // Helper function to get color based on confidence score
  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'bg-red-500';
    if (score >= 0.6) return 'bg-orange-400';
    return 'bg-yellow-300';
  };

  // Helper function to get recommendations based on LD type
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

  // Get disability color
  const getDisabilityColor = (name) => {
    if (name === 'Dyslexia') return 'bg-blue-600';
    if (name === 'Dysgraphia') return 'bg-purple-600';
    return 'bg-green-600';
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">{`Score: ${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg shadow">
          <h1 className="text-2xl font-bold">Learning Assessment Dashboard</h1>
          <p className="text-base">AI-Powered Learning Disability Assessment Results</p>
        </div>
        
        {/* Summary Card */}
        <div className="bg-white p-4 shadow-md rounded-b-lg mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Student Profile</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Name:</div>
                <div className="font-medium">{data.studentProfile.name}</div>
                <div className="text-gray-600">Age:</div>
                <div className="font-medium">{data.studentProfile.age}</div>
                <div className="text-gray-600">Relationship:</div>
                <div className="font-medium">{data.studentProfile.relationship}</div>
                <div className="text-gray-600">Learning Style:</div>
                <div className="font-medium">{data.studentProfile.preferredLearningStyle.join(', ')}</div>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Primary Assessment</h2>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-base mb-1">Primary learning challenge identified:</p>
                <p className="text-xl font-bold text-blue-700">{primaryLD.name}</p>
                <p className="text-xs text-gray-600 mb-2">Confidence score: {primaryLD.score.toFixed(1)}%</p>
                <p className="text-sm">Additional learning challenges detected with varying confidence levels.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Learning Disabilities Assessment */}
        <div className="bg-white p-4 shadow-md rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Learning Disabilities Assessment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {Object.entries(data.learningDisabilities).map(([name, details]) => (
              <div key={name} className="border rounded-lg overflow-hidden shadow-sm">
                <div className={`p-2 text-white font-medium ${getDisabilityColor(name)}`}>
                  {name}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Confidence Score:</span>
                    <span className="font-semibold text-sm">{(details.confidenceScore * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getConfidenceColor(details.confidenceScore)}`} style={{ width: `${details.confidenceScore * 100}%` }}></div>
                  </div>
                  <p className="text-xs mt-3 mb-1 text-gray-600">Key Indicators:</p>
                  <ul className="text-xs max-h-36 overflow-y-auto list-disc pl-4">
                    {details.indicators.slice(0, 3).map((indicator, idx) => (
                      <li key={idx} className="mb-1">{indicator}</li>
                    ))}
                    {details.indicators.length > 3 && (
                      <li className="text-blue-600 cursor-pointer text-xs">+ {details.indicators.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          {/* Score Comparison Chart */}
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">Learning Disability Confidence Scores</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ldScores} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Emotional Analysis */}
        <div className="bg-white p-4 shadow-md rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Emotional Analysis During Assessment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-md font-medium mb-2">Dominant Emotions</h3>
              <p className="mb-3 text-sm text-gray-600">Emotional states observed during the assessment:</p>
              
              <div className="flex gap-3 mb-4">
                {data.emotionAnalysis.dominantEmotions.map((emotion, index) => (
                  <div key={emotion} className="bg-gray-100 px-3 py-2 rounded-lg text-center">
                    <div className="text-md font-medium">{emotion}</div>
                    <div className="text-xs text-gray-600">
                      {Math.round((data.emotionAnalysis.emotionOccurrences[emotion] / totalEmotions) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-600">
                <span className="font-medium">Analysis:</span> The prevalence of anger emotions during the assessment may indicate frustration with learning tasks. This is common for students with learning disabilities.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Emotion Distribution</h3>
              <div className="h-48">
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
              <div className="flex justify-center gap-6 mt-2">
                {emotionData.map((item, index) => (
                  <div key={item.emotion} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: EMOTION_COLORS[index] }}></div>
                    <span className="text-xs">{item.emotion}: {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="bg-white p-4 shadow-md rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">Personalized Recommendations</h2>
          
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Primary Focus Area: {primaryLD.name}</h3>
            <p className="text-sm text-gray-600 mb-3">Based on the assessment results, the following strategies are recommended:</p>
            
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getRecommendations(primaryLD.name).map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <div className="mt-1 text-green-500">✓</div>
                  <div>{rec}</div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-sm mb-1">Next Steps</h3>
            <p className="text-xs">
              This AI-powered assessment provides valuable insights, but we recommend consulting with learning specialists for a comprehensive evaluation. The AI Learning Assistant can be configured to implement these recommendations in future learning sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;