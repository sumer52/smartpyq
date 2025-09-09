// syllabus.seed.js
// Syllabus data for different degree streams (B.Sc, B.Com, BBA, BCA)
// Organized by stream, program, year, and semester

export const syllabusData = {
  // 🎓 B.Sc Programs
  bsc: {
    stream: "Science",
    programs: {
      mscs: {
        name: "Mathematics, Statistics, Computer Science (MSCS)",
        years: {
          1: {
            semesters: {
              1: [
                "Environmental Studies",
                "English-1",
                "telugu I", "Sanskrit","Hindi",
                "Differential & Integral Calculus",
                "Descriptive Statistics and Probability",
                "Programming in C",
              ],
              2: [
                "Environmental Studies",
                "English-2",
                "telugu II","Sanskrit","Hindi",
                "Differential Equations",
                "Probability Distributions",
                "Programming in C++",
              ],
            },
          },
          2: {
            semesters: {
              3: [
                "English-3",
                "Hindi"," sanskrit","telugu"I",
                "Linear Algebra",
                "Probability & Statistics-II",
                "Data Structures and Algorithms",
                "Computer Organization",
                "Mathematics Practical",
                "CS Practical",
              ],
              4: [
                "English-4",
                "Hindi"," sanskrit","telugu"",
                "Real Analysis",
                "Statistical Methods",
                "Database Management Systems",
                "Operating Systems",
                "Mathematics Practical",
                "CS Practical",
              ],
            },
          },
          3: {
            semesters: {
              5: [
                "English-5",
                "Hindi"," sanskrit","telugu",
                "Complex Analysis",
                "Regression & Multivariate Statistics",
                "Computer Networks",
                "Software Engineering",
                "Mathematics Practical",
                "CS Practical",
              ],
              6: [
                "English-6",
                "Hindi"," sanskrit","telugu"",
                "Numerical Analysis",
                "Design of Experiments",
                "Web Technologies",
                "Machine Learning",
                "Mathematics Practical",
                "CS Practical",
              ],
            },
          },
        },
      },

      msds: {
        name: "Mathematics, Statistics, Data Science (MSDS)",
        years: {
          1: {
            semesters: {
              1: [
                "Environmental Studies",
                "English-1",
                "Hindi",
                "Sanskrit",
                "Telugu",
                "Problem Solving and Python Programming",
              ],
              2: [
                "Environmental Studies",
                "English-2",
                "Hindi",
                "Sanskrit",
                "Telugu",
                "Data Structures and Algorithms",
              ],
            },
          },
          2: {
            semesters: {
              3: [
                "English-3",
                "Hindi",
                "Sanskrit",
                "Telugu",
                "Probability & Statistics III",
                "Linear Algebra",
                "Database Management Systems",
                "Python Practical",
              ],
              4: [
                "English-4",
                "Hindi",
                "Sanskrit",
                "Telugu",
                "Regression Analysis",
                "Real Analysis",
                "Big Data Fundamentals",
                "Data Science Lab",
              ],
            },
          },
          3: {
            semesters: {
              5: [
                "English-5",
                "Hindi",
                "Sanskrit",
                "Telugu",
                "Machine Learning",
                "Statistical Inference",
                "Data Visualization",
                "Python/ML Practical",
              ],
              6: [
                "English-6",
                "Hindi",
                "Sanskrit",
                "Telugu",
                "Deep Learning",
                "Time Series Analysis",
                "Capstone Project",
                "Data Science Practical",
              ],
            },
          },
        },
      },

      lifeSciences: {
        name: "Life Sciences",
        years: {
          1: {
            semesters: {
              1: [
                "Environmental Studies",
                "English-1",
                "Hindi"," sanskrit","telugu",
                "General Microbiology",
              ],
              2: [
                "Environmental Studies",
                "English-2",
                "Hindi"," sanskrit","telugu",
                "Microbial Diversity",
              ],
            },
          },
          2: {
            semesters: {
              3: [
                "English-3",
                "Hindi"," sanskrit","telugu",
                "Biochemistry I",
                "Genetics I",
                "Microbiology Lab",
              ],
              4: [
                "English-4",
                "Hindi"," sanskrit","telugu",
                "Biochemistry II",
                "Genetics II",
                "Cell Biology Lab",
              ],
            },
          },
          3: {
            semesters: {
              5: [
                "English-5",
                "Hindi"," sanskrit","telugu",
                "Molecular Biology",
                "Immunology",
                "Biochemistry Lab",
              ],
              6: [
                "English-6",
                "Hindi"," sanskrit","telugu",
                "Genomics",
                "Biotechnology",
                "Research Project/Practical",
              ],
            },
          },
        },
      },
    },
  },

  // 💼 B.Com Programs
  bcom: {
    stream: "Commerce",
    programs: {
      general: {
        name: "B.Com General",
        years: {
          1: {
            semesters: {
              1: [
                "English-1",
                "Hindi"," sanskrit","telugu",
                "Financial Accounting-I",
                "Business Organization and Management",
                "Business Economics",
              ],
              2: [
                "English-2",
                "Hindi"," sanskrit","telugu",
                "Financial Accounting-II",
                "Business Laws",
                "Banking and Financial Services",
              ],
            },
          },
          2: {
            semesters: {
              3: [
                "English-3",
                "Hindi"," sanskrit","telugu",
                "Corporate Accounting",
                "Business Statistics I",
                "Cost Accounting",
              ],
              4: [
                "English-4",
                "Hindi"," sanskrit","telugu",
                "Income Tax I",
                "Business Statistics II",
                "Auditing I",
              ],
            },
          },
          3: {
            semesters: {
              5: [
                "English-5",
                "Hindi"," sanskrit","telugu",
                "Advanced Accounting",
                "Cost and Management Accounting",
                "Financial Management I",
              ],
              6: [
                "English-6",
                "Hindi"," sanskrit","telugu",
                "Project Work",
                "Financial Management II",
                "International Trade",
              ],
            },
          },
        },
      },
      // Similarly add B.Com Computers, Honours, Business Analytics...
    },
  },

  // 📊 BBA Programs
  bba: {
    stream: "Management",
    programs: {
      general: {
        name: "BBA General",
        years: {
          1: {
            semesters: {
              1: [
                "English-1",
                "Hindi"," sanskrit","telugu",
                "Principles of Management",
                "Basics of Marketing",
                "Business Economics",
              ],
              2: [
                "English-2",
                "Hindi"," sanskrit","telugu",
                "Organization Behaviour",
                "Business Statistics",
                "Business Law",
              ],
            },
          },
          2: {
            semesters: {
              3: [
                "English-3",
                "Hindi"," sanskrit","telugu",
                "Human Resource Management",
                "Operations Management",
                "Quantitative Techniques",
              ],
              4: [
                "English-4",
                "Hindi"," sanskrit","telugu",
                "Financial Management",
                "Project Management",
                "Entrepreneurship",
              ],
            },
          },
          3: {
            semesters: {
              5: [
                "English-5",
                "Hindi"," sanskrit","telugu",
                "Strategic Management",
                "Marketing Management",
                "Business Research Methods",
              ],
              6: [
                "English-6",
                "Hindi"," sanskrit","telugu",
                "Project Work",
                "Global Business",
                "E-Commerce",
              ],
            },
          },
        },
      },
    },
  },

  // 💻 BCA
  bca: {
    stream: "Computer Applications",
    programs: {
      general: {
        name: "BCA General",
        years: {
          1: {
            semesters: {
              1: [
                "Mathematical Foundations",
                "Digital Principles",
                "Programming in C",
                "Introduction to Web Technology",
                "Effective Communication",
              ],
              2: [
                "Probability & Statistics",
                "Object Oriented Programming with C++",
                "Computer Architecture",
                "Data Structures",
                "Advanced Computer Networks",
              ],
            },
          },
          2: {
            semesters: {
              3: [
                "English-3",
                "Hindi"," sanskrit","telugu",
                "Database Management Systems",
                "Operating Systems",
                "Software Engineering",
                "Python/Java Lab",
              ],
              4: [
                "English-4",
                "Hindi"," sanskrit","telugu",
                "Web Technologies",
                "Computer Networks",
                "Mobile App Development",
                "DBMS Lab",
              ],
            },
          },
          3: {
            semesters: {
              5: [
                "English-5",
                "Hindi"," sanskrit","telugu",
                "Machine Learning Basics",
                "Cyber Security",
                "Cloud Computing",
                "Software Project Lab",
              ],
              6: [
                "English-6",
                "Hindi"," sanskrit","telugu"",
                "Capstone Project",
                "Data Analytics",
                "Enterprise Resource Planning",
                "Project Lab",
              ],
            },
          },
        },
      },
    },
  },
};

// Search utility functions
export const searchSyllabus = (query) => {
  const results = [];
  const searchTerm = query.toLowerCase();

  Object.entries(syllabusData).forEach(([key, streamData]) => {
    const { stream, subject, semesters } = streamData;
    
    // Search in stream and subject names
    if (stream.toLowerCase().includes(searchTerm) || 
        subject.toLowerCase().includes(searchTerm)) {
      results.push({
        type: 'subject',
        stream,
        subject,
        relevance: 1.0
      });
    }

    // Search in semester subjects and topics
    Object.entries(semesters).forEach(([semNum, semesterData]) => {
      semesterData.subjects.forEach(subjectData => {
        const { code, name, topics } = subjectData;
        
        // Search in subject code and name
        if (code.toLowerCase().includes(searchTerm) || 
            name.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'course',
            stream,
            subject,
            semester: semesterData.name,
            code,
            name,
            relevance: 0.9
          });
        }
        
        // Search in topics
        topics.forEach(topic => {
          if (topic.toLowerCase().includes(searchTerm)) {
            results.push({
              type: 'topic',
              stream,
              subject,
              semester: semesterData.name,
              course: name,
              topic,
              relevance: 0.7
            });
          }
        });
      });
    });
  });

  // Sort by relevance and remove duplicates
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10); // Limit to top 10 results
};

// Get subjects by stream
export const getSubjectsByStream = (stream) => {
  const subjects = [];
  
  Object.entries(syllabusData).forEach(([key, streamData]) => {
    if (streamData.stream.toLowerCase() === stream.toLowerCase()) {
      subjects.push({
        key,
        subject: streamData.subject,
        stream: streamData.stream
      });
    }
  });
  
  return subjects;
};

// Get all streams
export const getAllStreams = () => {
  const streams = new Set();
  
  Object.values(syllabusData).forEach(streamData => {
    streams.add(streamData.stream);
  });
  
  return Array.from(streams);
};

// Get all subjects
export const getAllSubjects = () => {
  const subjects = [];
  
  Object.values(syllabusData).forEach(streamData => {
    subjects.push({
      subject: streamData.subject,
      stream: streamData.stream
    });
  });
  
  return subjects;
};

// Get course details
export const getCourseDetails = (stream, subject, semester, courseCode) => {
  const streamKey = Object.keys(syllabusData).find(key => 
    syllabusData[key].stream === stream && 
    syllabusData[key].subject === subject
  );
  
  if (!streamKey) return null;
  
  const semesterNum = semester.replace('Semester ', '');
  const semesterData = syllabusData[streamKey].semesters[semesterNum];
  
  if (!semesterData) return null;
  
  return semesterData.subjects.find(course => course.code === courseCode);
};

export default syllabusData;