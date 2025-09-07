// Comprehensive syllabus data for local search and demo purposes
// This data includes various streams, subjects, and detailed syllabus information

export const syllabusData = {
  // Computer Science & Engineering
  computerScience: {
    stream: 'Engineering',
    subject: 'Computer Science',
    semesters: {
      1: {
        name: 'Semester 1',
        subjects: [
          {
            code: 'CS101',
            name: 'Programming Fundamentals',
            topics: [
              'Introduction to Programming',
              'Variables and Data Types',
              'Control Structures',
              'Functions and Procedures',
              'Arrays and Strings',
              'File Handling',
              'Debugging Techniques'
            ],
            credits: 4
          },
          {
            code: 'MA101',
            name: 'Engineering Mathematics I',
            topics: [
              'Differential Calculus',
              'Integral Calculus',
              'Matrices and Determinants',
              'Vector Calculus',
              'Infinite Series',
              'Applications of Derivatives'
            ],
            credits: 4
          },
          {
            code: 'PH101',
            name: 'Engineering Physics',
            topics: [
              'Mechanics',
              'Wave Motion',
              'Thermodynamics',
              'Electromagnetism',
              'Modern Physics',
              'Quantum Mechanics Basics'
            ],
            credits: 3
          }
        ]
      },
      2: {
        name: 'Semester 2',
        subjects: [
          {
            code: 'CS201',
            name: 'Data Structures',
            topics: [
              'Introduction to Data Structures',
              'Arrays and Linked Lists',
              'Stacks and Queues',
              'Trees and Binary Trees',
              'Graphs and Graph Algorithms',
              'Hashing Techniques',
              'Sorting and Searching Algorithms'
            ],
            credits: 4
          },
          {
            code: 'CS202',
            name: 'Object Oriented Programming',
            topics: [
              'OOP Concepts',
              'Classes and Objects',
              'Inheritance',
              'Polymorphism',
              'Encapsulation',
              'Abstract Classes',
              'Exception Handling'
            ],
            credits: 4
          },
          {
            code: 'MA201',
            name: 'Engineering Mathematics II',
            topics: [
              'Differential Equations',
              'Laplace Transforms',
              'Fourier Series',
              'Complex Analysis',
              'Probability and Statistics',
              'Numerical Methods'
            ],
            credits: 4
          }
        ]
      },
      3: {
        name: 'Semester 3',
        subjects: [
          {
            code: 'CS301',
            name: 'Database Management Systems',
            topics: [
              'Introduction to DBMS',
              'Relational Model',
              'SQL and Query Processing',
              'Normalization',
              'Transaction Management',
              'Concurrency Control',
              'Database Security'
            ],
            credits: 4
          },
          {
            code: 'CS302',
            name: 'Computer Networks',
            topics: [
              'Network Fundamentals',
              'OSI and TCP/IP Models',
              'Data Link Layer',
              'Network Layer',
              'Transport Layer',
              'Application Layer',
              'Network Security'
            ],
            credits: 4
          },
          {
            code: 'CS303',
            name: 'Operating Systems',
            topics: [
              'OS Introduction',
              'Process Management',
              'Memory Management',
              'File Systems',
              'I/O Management',
              'Deadlocks',
              'Security and Protection'
            ],
            credits: 4
          }
        ]
      },
      4: {
        name: 'Semester 4',
        subjects: [
          {
            code: 'CS401',
            name: 'Algorithms Analysis',
            topics: [
              'Algorithm Complexity',
              'Divide and Conquer',
              'Dynamic Programming',
              'Greedy Algorithms',
              'Graph Algorithms',
              'String Algorithms',
              'Advanced Data Structures'
            ],
            credits: 4
          },
          {
            code: 'CS402',
            name: 'Software Engineering',
            topics: [
              'Software Development Life Cycle',
              'Requirements Engineering',
              'System Design',
              'Testing Strategies',
              'Project Management',
              'Quality Assurance',
              'Maintenance and Evolution'
            ],
            credits: 4
          },
          {
            code: 'CS403',
            name: 'Computer Architecture',
            topics: [
              'Processor Design',
              'Memory Hierarchy',
              'Instruction Set Architecture',
              'Pipelining',
              'Cache Memory',
              'Parallel Processing',
              'Performance Evaluation'
            ],
            credits: 4
          }
        ]
      },
      5: {
        name: 'Semester 5',
        subjects: [
          {
            code: 'CS501',
            name: 'Machine Learning',
            topics: [
              'Introduction to ML',
              'Supervised Learning',
              'Unsupervised Learning',
              'Neural Networks',
              'Deep Learning Basics',
              'Model Evaluation',
              'Feature Engineering'
            ],
            credits: 4
          },
          {
            code: 'CS502',
            name: 'Web Technologies',
            topics: [
              'HTML and CSS',
              'JavaScript Programming',
              'Server-side Programming',
              'Database Integration',
              'Web Security',
              'RESTful APIs',
              'Modern Web Frameworks'
            ],
            credits: 4
          },
          {
            code: 'CS503',
            name: 'Compiler Design',
            topics: [
              'Lexical Analysis',
              'Syntax Analysis',
              'Semantic Analysis',
              'Code Generation',
              'Code Optimization',
              'Error Handling',
              'Symbol Table Management'
            ],
            credits: 4
          }
        ]
      },
      6: {
        name: 'Semester 6',
        subjects: [
          {
            code: 'CS601',
            name: 'Artificial Intelligence',
            topics: [
              'AI Fundamentals',
              'Search Algorithms',
              'Knowledge Representation',
              'Expert Systems',
              'Natural Language Processing',
              'Computer Vision',
              'Robotics Basics'
            ],
            credits: 4
          },
          {
            code: 'CS602',
            name: 'Distributed Systems',
            topics: [
              'Distributed System Models',
              'Communication Protocols',
              'Distributed Algorithms',
              'Fault Tolerance',
              'Consensus Algorithms',
              'Distributed Databases',
              'Cloud Computing'
            ],
            credits: 4
          },
          {
            code: 'CS603',
            name: 'Information Security',
            topics: [
              'Cryptography Fundamentals',
              'Network Security',
              'Web Security',
              'Malware Analysis',
              'Digital Forensics',
              'Security Policies',
              'Ethical Hacking'
            ],
            credits: 4
          }
        ]
      }
    }
  },

  // Mathematics
  mathematics: {
    stream: 'Science',
    subject: 'Mathematics',
    semesters: {
      1: {
        name: 'Semester 1',
        subjects: [
          {
            code: 'MATH101',
            name: 'Calculus I',
            topics: [
              'Limits and Continuity',
              'Derivatives',
              'Applications of Derivatives',
              'Integration',
              'Fundamental Theorem of Calculus',
              'Applications of Integration'
            ],
            credits: 4
          },
          {
            code: 'MATH102',
            name: 'Linear Algebra',
            topics: [
              'Vector Spaces',
              'Linear Transformations',
              'Matrices',
              'Determinants',
              'Eigenvalues and Eigenvectors',
              'Diagonalization'
            ],
            credits: 4
          }
        ]
      },
      2: {
        name: 'Semester 2',
        subjects: [
          {
            code: 'MATH201',
            name: 'Calculus II',
            topics: [
              'Sequences and Series',
              'Power Series',
              'Taylor and Maclaurin Series',
              'Multivariable Calculus',
              'Partial Derivatives',
              'Multiple Integrals'
            ],
            credits: 4
          },
          {
            code: 'MATH202',
            name: 'Differential Equations',
            topics: [
              'First Order ODEs',
              'Second Order ODEs',
              'Higher Order ODEs',
              'Systems of ODEs',
              'Laplace Transforms',
              'Partial Differential Equations'
            ],
            credits: 4
          }
        ]
      }
    }
  },

  // Physics
  physics: {
    stream: 'Science',
    subject: 'Physics',
    semesters: {
      1: {
        name: 'Semester 1',
        subjects: [
          {
            code: 'PHY101',
            name: 'Classical Mechanics',
            topics: [
              'Kinematics',
              'Newton\'s Laws',
              'Work and Energy',
              'Momentum and Collisions',
              'Rotational Motion',
              'Oscillations',
              'Gravitation'
            ],
            credits: 4
          },
          {
            code: 'PHY102',
            name: 'Waves and Optics',
            topics: [
              'Wave Motion',
              'Sound Waves',
              'Electromagnetic Waves',
              'Geometric Optics',
              'Wave Optics',
              'Interference and Diffraction',
              'Polarization'
            ],
            credits: 4
          }
        ]
      },
      2: {
        name: 'Semester 2',
        subjects: [
          {
            code: 'PHY201',
            name: 'Thermodynamics',
            topics: [
              'Laws of Thermodynamics',
              'Heat Engines',
              'Entropy',
              'Phase Transitions',
              'Statistical Mechanics',
              'Kinetic Theory'
            ],
            credits: 4
          },
          {
            code: 'PHY202',
            name: 'Electromagnetism',
            topics: [
              'Electric Fields',
              'Gauss\'s Law',
              'Electric Potential',
              'Magnetic Fields',
              'Faraday\'s Law',
              'Maxwell\'s Equations'
            ],
            credits: 4
          }
        ]
      },
      3: {
        name: 'Semester 3',
        subjects: [
          {
            code: 'PHY301',
            name: 'Quantum Mechanics',
            topics: [
              'Wave-Particle Duality',
              'Schrödinger Equation',
              'Quantum Operators',
              'Hydrogen Atom',
              'Angular Momentum',
              'Spin',
              'Perturbation Theory'
            ],
            credits: 4
          },
          {
            code: 'PHY302',
            name: 'Solid State Physics',
            topics: [
              'Crystal Structure',
              'Lattice Dynamics',
              'Electronic Properties',
              'Band Theory',
              'Semiconductors',
              'Superconductivity'
            ],
            credits: 4
          }
        ]
      }
    }
  },

  // Chemistry
  chemistry: {
    stream: 'Science',
    subject: 'Chemistry',
    semesters: {
      1: {
        name: 'Semester 1',
        subjects: [
          {
            code: 'CHEM101',
            name: 'General Chemistry',
            topics: [
              'Atomic Structure',
              'Chemical Bonding',
              'Molecular Geometry',
              'Stoichiometry',
              'Thermochemistry',
              'Chemical Equilibrium'
            ],
            credits: 4
          },
          {
            code: 'CHEM102',
            name: 'Inorganic Chemistry I',
            topics: [
              'Periodic Table',
              'Main Group Elements',
              'Coordination Chemistry',
              'Crystal Field Theory',
              'Organometallic Chemistry',
              'Bioinorganic Chemistry'
            ],
            credits: 4
          }
        ]
      },
      2: {
        name: 'Semester 2',
        subjects: [
          {
            code: 'CHEM201',
            name: 'Organic Chemistry I',
            topics: [
              'Structure and Bonding',
              'Alkanes and Cycloalkanes',
              'Stereochemistry',
              'Alkenes and Alkynes',
              'Aromatic Compounds',
              'Substitution Reactions',
              'Elimination Reactions'
            ],
            credits: 4
          },
          {
            code: 'CHEM202',
            name: 'Physical Chemistry I',
            topics: [
              'Thermodynamics',
              'Chemical Kinetics',
              'Quantum Chemistry',
              'Spectroscopy',
              'Statistical Mechanics',
              'Electrochemistry'
            ],
            credits: 4
          }
        ]
      }
    }
  },

  // Business Administration
  businessAdministration: {
    stream: 'Commerce',
    subject: 'Business Administration',
    semesters: {
      1: {
        name: 'Semester 1',
        subjects: [
          {
            code: 'BBA101',
            name: 'Principles of Management',
            topics: [
              'Management Functions',
              'Planning and Decision Making',
              'Organizing',
              'Leading and Motivating',
              'Controlling',
              'Management Theories',
              'Contemporary Management Issues'
            ],
            credits: 4
          },
          {
            code: 'BBA102',
            name: 'Financial Accounting',
            topics: [
              'Accounting Principles',
              'Journal Entries',
              'Ledger Posting',
              'Trial Balance',
              'Financial Statements',
              'Cash Flow Analysis',
              'Ratio Analysis'
            ],
            credits: 4
          }
        ]
      },
      2: {
        name: 'Semester 2',
        subjects: [
          {
            code: 'BBA201',
            name: 'Marketing Management',
            topics: [
              'Marketing Concepts',
              'Consumer Behavior',
              'Market Research',
              'Product Management',
              'Pricing Strategies',
              'Distribution Channels',
              'Promotion and Advertising'
            ],
            credits: 4
          },
          {
            code: 'BBA202',
            name: 'Human Resource Management',
            topics: [
              'HR Planning',
              'Recruitment and Selection',
              'Training and Development',
              'Performance Management',
              'Compensation Management',
              'Employee Relations',
              'HR Analytics'
            ],
            credits: 4
          }
        ]
      }
    }
  },

  // Economics
  economics: {
    stream: 'Commerce',
    subject: 'Economics',
    semesters: {
      1: {
        name: 'Semester 1',
        subjects: [
          {
            code: 'ECON101',
            name: 'Microeconomics',
            topics: [
              'Supply and Demand',
              'Consumer Theory',
              'Producer Theory',
              'Market Structures',
              'Game Theory',
              'Welfare Economics',
              'Market Failures'
            ],
            credits: 4
          },
          {
            code: 'ECON102',
            name: 'Macroeconomics',
            topics: [
              'National Income Accounting',
              'Aggregate Demand and Supply',
              'Fiscal Policy',
              'Monetary Policy',
              'Inflation and Unemployment',
              'Economic Growth',
              'International Trade'
            ],
            credits: 4
          }
        ]
      }
    }
  },

  // English Literature
  englishLiterature: {
    stream: 'Arts',
    subject: 'English Literature',
    semesters: {
      1: {
        name: 'Semester 1',
        subjects: [
          {
            code: 'ENG101',
            name: 'British Literature I',
            topics: [
              'Medieval Literature',
              'Renaissance Literature',
              'Shakespeare Studies',
              'Metaphysical Poetry',
              'Restoration Drama',
              'Augustan Literature'
            ],
            credits: 4
          },
          {
            code: 'ENG102',
            name: 'Literary Criticism',
            topics: [
              'Classical Criticism',
              'Romantic Criticism',
              'Modern Criticism',
              'Formalism',
              'Structuralism',
              'Post-structuralism',
              'Contemporary Theory'
            ],
            credits: 4
          }
        ]
      },
      2: {
        name: 'Semester 2',
        subjects: [
          {
            code: 'ENG201',
            name: 'American Literature',
            topics: [
              'Colonial Literature',
              'Transcendentalism',
              'Realism and Naturalism',
              'Modernism',
              'Harlem Renaissance',
              'Contemporary American Literature'
            ],
            credits: 4
          },
          {
            code: 'ENG202',
            name: 'World Literature',
            topics: [
              'Ancient Literature',
              'European Literature',
              'Asian Literature',
              'African Literature',
              'Latin American Literature',
              'Postcolonial Literature'
            ],
            credits: 4
          }
        ]
      }
    }
  }
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