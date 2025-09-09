// Comprehensive PYQ (Previous Year Questions) Data Structure

export const pyqData = {
  years: [
    {
      id: 'year1',
      name: '1st Year',
      displayName: '1st Year',
      semesters: [
        { id: 'sem1', name: 'Semester 1', displayName: 'Sem 1' },
        { id: 'sem2', name: 'Semester 2', displayName: 'Sem 2' }
      ]
    },
    {
      id: 'year2',
      name: '2nd Year',
      displayName: '2nd Year',
      semesters: [
        { id: 'sem3', name: 'Semester 3', displayName: 'Sem 3' },
        { id: 'sem4', name: 'Semester 4', displayName: 'Sem 4' }
      ]
    },
    {
      id: 'year3',
      name: '3rd Year',
      displayName: '3rd Year',
      semesters: [
        { id: 'sem5', name: 'Semester 5', displayName: 'Sem 5' },
        { id: 'sem6', name: 'Semester 6', displayName: 'Sem 6' }
      ]
    }
  ],

  examYears: [2019, 2021, 2022, 2023, 2024, 2025],

  streams: {
    bsc: {
      id: 'bsc',
      name: 'B.Sc',
      displayName: '🎓 B.Sc',
      specializations: {
        mscs: {
          id: 'mscs',
          name: 'Mathematics and Computer Science',
          displayName: 'MSCS',
          subjects: {
            sem1: ['Environmental Studies', 'English', 'Hindi', 'Sanskrit', 'Telugu', 'Calculus', 'Statistics', 'Programming C/C++'],
            sem2: ['Environmental Studies', 'English', 'Hindi', 'Sanskrit', 'Telugu', 'Linear Algebra', 'Statistics', 'Programming C/C++'],
            sem3: ['DBMS', 'Operating Systems', 'Data Structures', 'Calculus II', 'Discrete Mathematics'],
            sem4: ['Networks', 'Software Engineering', 'Algorithms', 'Computer Graphics', 'Web Technologies'],
            sem5: ['Machine Learning', 'Artificial Intelligence', 'Computer Networks', 'Database Systems', 'Practical Labs'],
            sem6: ['Web Technologies', 'Mobile Computing', 'Cloud Computing', 'Project Work', 'Practical Labs']
          }
        },
        msds: {
          id: 'msds',
          name: 'Mathematics and Data Science',
          displayName: 'MSDS',
          subjects: {
            sem1: ['Python Programming', 'Statistics', 'Linear Algebra', 'Calculus', 'English'],
            sem2: ['Data Structures & Algorithms', 'Probability & Statistics', 'Linear Algebra II', 'Python Advanced'],
            sem3: ['Database Management', 'Regression Analysis', 'Statistical Methods', 'Data Visualization'],
            sem4: ['Big Data Analytics', 'Machine Learning', 'Statistical Computing', 'Data Mining'],
            sem5: ['Deep Learning', 'Natural Language Processing', 'Time Series Analysis', 'Advanced ML'],
            sem6: ['Capstone Project', 'Business Intelligence', 'Data Engineering', 'Research Methodology']
          }
        },
        lifesciences: {
          id: 'lifesciences',
          name: 'Life Sciences',
          displayName: 'Life Sciences',
          subjects: {
            sem1: ['Microbiology', 'Biochemistry', 'Cell Biology', 'General Biology', 'Chemistry'],
            sem2: ['Genetics', 'Molecular Biology', 'Organic Chemistry', 'Physics', 'Mathematics'],
            sem3: ['Immunology', 'Plant Biology', 'Animal Physiology', 'Biostatistics'],
            sem4: ['Genomics', 'Biotechnology', 'Ecology', 'Evolution', 'Research Methods'],
            sem5: ['Advanced Genetics', 'Bioinformatics', 'Pharmacology', 'Toxicology'],
            sem6: ['Research Project', 'Bioethics', 'Industrial Biotechnology', 'Thesis Work']
          }
        }
      }
    },
    bcom: {
      id: 'bcom',
      name: 'B.Com',
      displayName: '💼 B.Com',
      specializations: {
        general: {
          id: 'general',
          name: 'General',
          displayName: 'General',
          subjects: {
            sem1: ['Financial Accounting', 'Business Organization', 'Economics', 'English', 'Mathematics'],
            sem2: ['Corporate Accounting', 'Business Law', 'Microeconomics', 'Statistics', 'Computer Applications'],
            sem3: ['Cost Accounting', 'Company Law', 'Macroeconomics', 'Banking', 'Taxation'],
            sem4: ['Management Accounting', 'Auditing', 'International Business', 'Marketing', 'Finance'],
            sem5: ['Advanced Accounting', 'Financial Management', 'Investment Analysis', 'Business Ethics'],
            sem6: ['Project Work', 'Entrepreneurship', 'Strategic Management', 'Research Methodology']
          }
        },
        computers: {
          id: 'computers',
          name: 'Computers',
          displayName: 'Computers',
          subjects: {
            sem1: ['Financial Accounting', 'Computer Fundamentals', 'Programming', 'Economics', 'English'],
            sem2: ['Corporate Accounting', 'Database Management', 'Web Technologies', 'Statistics', 'Business Law'],
            sem3: ['Cost Accounting', 'Software Engineering', 'Networking', 'Taxation', 'Company Law'],
            sem4: ['Management Accounting', 'System Analysis', 'E-Commerce', 'Marketing', 'Auditing'],
            sem5: ['Advanced Accounting', 'Machine Learning', 'Data Analytics', 'Financial Management'],
            sem6: ['Capstone Project', 'Business Intelligence', 'Digital Marketing', 'Entrepreneurship']
          }
        },
        honours: {
          id: 'honours',
          name: 'Honours',
          displayName: 'Honours',
          subjects: {
            sem1: ['Advanced Accounting', 'Business Economics', 'Quantitative Methods', 'English', 'Computer Applications'],
            sem2: ['Corporate Accounting', 'Managerial Economics', 'Business Statistics', 'Business Law', 'Financial Markets'],
            sem3: ['Cost & Management Accounting', 'International Economics', 'Research Methods', 'Company Law', 'Banking'],
            sem4: ['Advanced Cost Accounting', 'Public Finance', 'Investment Analysis', 'Auditing', 'Taxation'],
            sem5: ['Financial Management', 'International Business', 'Strategic Management', 'Advanced Taxation'],
            sem6: ['Research Project', 'Corporate Governance', 'Financial Derivatives', 'Business Ethics']
          }
        },
        businessanalytics: {
          id: 'businessanalytics',
          name: 'Business Analytics',
          displayName: 'Business Analytics',
          subjects: {
            sem1: ['Business Mathematics', 'Statistics', 'Computer Applications', 'Accounting', 'Economics'],
            sem2: ['Business Statistics', 'Database Management', 'Programming', 'Financial Accounting', 'Microeconomics'],
            sem3: ['Data Analytics', 'Operations Research', 'Cost Accounting', 'Marketing Research', 'Macroeconomics'],
            sem4: ['Machine Learning', 'Business Intelligence', 'Financial Management', 'Supply Chain Analytics', 'Auditing'],
            sem5: ['Advanced Analytics', 'Predictive Modeling', 'Digital Marketing', 'Risk Management'],
            sem6: ['Capstone Project', 'Big Data Analytics', 'Business Strategy', 'Entrepreneurship']
          }
        }
      }
    },
    bba: {
      id: 'bba',
      name: 'BBA',
      displayName: '📊 BBA',
      specializations: {
        general: {
          id: 'general',
          name: 'General',
          displayName: 'General',
          subjects: {
            sem1: ['Principles of Management', 'Business Economics', 'Accounting', 'English', 'Computer Applications'],
            sem2: ['Organizational Behavior', 'Marketing Management', 'Financial Accounting', 'Business Statistics', 'Business Law'],
            sem3: ['Human Resource Management', 'Operations Management', 'Cost Accounting', 'Research Methods', 'International Business'],
            sem4: ['Financial Management', 'Strategic Management', 'Consumer Behavior', 'Business Ethics', 'Entrepreneurship'],
            sem5: ['Investment Analysis', 'Supply Chain Management', 'Digital Marketing', 'Leadership', 'Project Management'],
            sem6: ['Capstone Project', 'Business Strategy', 'Corporate Governance', 'Innovation Management']
          }
        },
        businessanalytics: {
          id: 'businessanalytics',
          name: 'Business Analytics',
          displayName: 'Business Analytics',
          subjects: {
            sem1: ['Management Principles', 'Business Mathematics', 'Statistics', 'Computer Applications', 'Economics'],
            sem2: ['Organizational Behavior', 'Business Statistics', 'Database Management', 'Accounting', 'Marketing'],
            sem3: ['Operations Research', 'Data Analytics', 'HR Analytics', 'Financial Management', 'Research Methods'],
            sem4: ['Machine Learning', 'Business Intelligence', 'Marketing Analytics', 'Supply Chain Analytics', 'Strategic Management'],
            sem5: ['Advanced Analytics', 'Predictive Modeling', 'Customer Analytics', 'Risk Analytics', 'Digital Transformation'],
            sem6: ['Capstone Project', 'Big Data Analytics', 'Business Strategy', 'Consulting', 'Innovation']
          }
        }
      }
    },
    bca: {
      id: 'bca',
      name: 'BCA',
      displayName: '💻 BCA',
      specializations: {
        general: {
          id: 'general',
          name: 'General',
          displayName: 'General',
          subjects: {
            sem1: ['Mathematics', 'Programming in C', 'Computer Fundamentals', 'English', 'Environmental Studies'],
            sem2: ['Mathematics II', 'Programming in C++', 'Data Structures', 'Digital Electronics', 'Accounting'],
            sem3: ['Object Oriented Programming', 'Database Management', 'Computer Networks', 'Web Technologies', 'Statistics'],
            sem4: ['Operating Systems', 'Software Engineering', 'Java Programming', 'System Analysis', 'Mathematics III'],
            sem5: ['Machine Learning', 'Cloud Computing', 'Mobile Application Development', 'Artificial Intelligence', 'Project Management'],
            sem6: ['Capstone Project', 'Cyber Security', 'Big Data', 'IoT', 'Industry Training']
          }
        }
      }
    }
  }
};

// Helper functions for data access
export const getYears = () => pyqData.years;
export const getSemesters = (yearId) => {
  const year = pyqData.years.find(y => y.id === yearId);
  return year ? year.semesters : [];
};
export const getExamYears = () => pyqData.examYears;
export const getStreams = () => pyqData.streams;
export const getSpecializations = (streamId) => {
  const stream = pyqData.streams[streamId];
  return stream ? stream.specializations : {};
};
export const getSubjects = (streamId, specializationId, semesterId) => {
  const stream = pyqData.streams[streamId];
  if (!stream) return [];
  const specialization = stream.specializations[specializationId];
  if (!specialization) return [];
  return specialization.subjects[semesterId] || [];
};