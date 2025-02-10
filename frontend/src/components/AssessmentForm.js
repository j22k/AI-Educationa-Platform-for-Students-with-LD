import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

const questions = [
  {
    title: "Learning Assessment Questionnaire",
    category: "Help us understand the student better to provide personalized learning support.",
    fields: [
      { label: "Your relationship to the student:", type: "select", name: "relationship", options: ["Parent/Guardian", "Teacher", "Healthcare Professional", "Self"] },
      { label: "Name:", type: "text", name: "studentName" },
      { label: "Age of child:", type: "number", name: "age", min: 4, max: 21 },
      { label: "Previous Diagnosis (if any):", type: "textarea", name: "previousDiagnosis" },
      { label: "Main Concerns:", type: "textarea", name: "mainConcerns" },
      { label: "Preferred Learning Styles:", type: "checkbox", name: "preferredLearningStyle", options: ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"] },
      { label: "Student's Strengths:", type: "textarea", name: "strengths" },
      { label: "Current Struggles:", type: "textarea", name: "struggles" },
      { label: "Previous Support Received:", type: "textarea", name: "previousSupport" },
    ],
  },
  {
    title: "Dyslexia Diagnosis Questionnaire",
    category: "Phonological Awareness & Reading Skills",
    items: [
      "Does the child struggle with recognizing letters or letter sounds?",
      "Does the child have difficulty rhyming words (e.g., cat, hat, bat)?",
      "Does the child confuse similar-looking letters (b/d, p/q, m/w)?",
      "Does the child take longer than peers to read simple words?",
      "Does the child skip words or entire lines while reading?",
      "Does the child have difficulty pronouncing new or long words?",
      "Does the child frequently guess words instead of sounding them out?",
      "Does the child struggle with spelling and often misspell common words?",
      "Does the child forget what they just read, even if they read fluently?",
      "Does the child avoid reading aloud or show anxiety while reading?",
    ],
  },
  {
    title: "Dysgraphia Diagnosis Questionnaire",
    category: "Handwriting & Motor Control",
    items: [
      "Is the child's handwriting difficult to read or inconsistent?",
      "Does the child struggle with holding a pencil properly?",
      "Does the child complain about hand pain or fatigue while writing?",
      "Does the child mix up uppercase and lowercase letters within a word?",
      "Does the child struggle with spacing between words or letters?",
      "Does the child have difficulty copying from the board or a book?",
      "Does the child write letters or numbers in reverse (e.g., 3 instead of E)?",
      "Does the child avoid writing tasks or take significantly longer than peers?",
      "Does the child struggle with forming complete sentences or organizing thoughts on paper?",
      "Does the child have trouble remembering how to write certain letters?",
    ],
  },
  {
    title: "Dyscalculia Diagnosis Questionnaire",
    category: "Number Sense & Basic Arithmetic",
    items: [
      "Does the child struggle with recognizing numbers?",
      "Does the child mix up numbers (e.g., 13 vs. 31) when reading or writing?",
      "Does the child struggle with simple counting or skip numbers while counting?",
      "Does the child have trouble understanding basic math symbols (+, -, ×, ÷)?",
      "Does the child struggle with mental math or estimating quantities?",
      "Does the child rely heavily on finger counting for simple math problems?",
      "Does the child have trouble understanding place value (e.g., tens, hundreds)?",
      "Does the child struggle with word problems or multi-step math instructions?",
      "Does the child find it difficult to tell time on an analog clock?",
      "Does the child struggle with patterns, sequences, or number relationships?",
    ],
  },
];

// Initialize responses so that pages with 'fields' are objects,
// and pages with 'items' are objects with keys set to each question text.
const initializeResponses = () => {
  return questions.map(q => {
    if (q.fields) {
      return {};
    } else {
      const obj = {};
      q.items.forEach(item => {
        obj[item] = "";
      });
      return obj;
    }
  });
};

const AssessmentForm = () => {
  const [page, setPage] = useState(0);
  const [responses, setResponses] = useState(initializeResponses());
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateFields = () => {
    const currentQuestion = questions[page];
    const newErrors = {};

    if (currentQuestion.fields) {
      currentQuestion.fields.forEach((field) => {
        const value = responses[page][field.name];
        if (!value && field.type !== "textarea") {
          newErrors[field.name] = "This field is required";
        }
        if (field.type === "number" && value) {
          if (value < field.min || value > field.max) {
            newErrors[field.name] = `Age must be between ${field.min} and ${field.max}`;
          }
        }
      });
    } else {
      const currentResponses = responses[page];
      // Check that every question has an answer
      Object.keys(currentResponses).forEach(key => {
        if (!currentResponses[key]) {
          newErrors.items = "Please answer all questions";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // For fields pages (object-based) update by key
  const handleChange = (name, value) => {
    setResponses((prev) => {
      const newResponses = [...prev];
      newResponses[page] = { ...newResponses[page], [name]: value };
      return newResponses;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // For items pages update using the question text as key
  const handleRadioChange = (question, value) => {
    setResponses((prev) => {
      const newResponses = [...prev];
      newResponses[page] = { ...newResponses[page], [question]: value };
      return newResponses;
    });
    setErrors({});
  };

  const handleNext = () => {
    if (validateFields() && page < questions.length - 1) {
      setPage(page + 1);
      setErrors({});
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateFields()) {
      try {
        const userId = localStorage.getItem('userId'); // Get userId from localStorage
        
        const formData = {
          userId,
          assessmentData: responses
        };

        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/submitassesment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Assessment submitted:', data);
        
        if (response.status) {
          alert('Assessment submitted successfully!');
          navigate('/LD_identification');
        } else {
          throw new Error(data.message || 'Failed to submit assessment');
        }
      } catch (error) {
        console.error('Error submitting assessment:', error);
        alert('Failed to submit assessment. Please try again.');
      }
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case "select":
        return (
          <select
            name={field.name}
            value={responses[page][field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select {field.name}</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="grid grid-cols-2 gap-4">
            {field.options.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(responses[page][field.name] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = responses[page][field.name] || [];
                    handleChange(
                      field.name,
                      e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v) => v !== option)
                    );
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case "textarea":
        return (
          <textarea
            value={responses[page][field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
          />
        );
      default:
        return (
          <input
            type={field.type}
            value={responses[page][field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            min={field.min}
            max={field.max}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {questions[page].title}
          </h2>
          <p className="text-gray-600 text-center mt-2 mb-6">
            {questions[page].category}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {questions[page].fields ? (
              questions[page].fields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  {renderField(field)}
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="space-y-4">
                {questions[page].items.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">{question}</p>
                    <div className="flex space-x-4">
                      {["yes", "no"].map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={question}
                            value={option}
                            checked={responses[page][question] === option}
                            onChange={(e) => handleRadioChange(question, e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                {errors.items && (
                  <p className="text-red-500 text-sm mt-1">{errors.items}</p>
                )}
              </div>
            )}

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={page === 0}
                className={`px-4 py-2 rounded-lg font-medium ${
                  page === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              {page < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;
