// API Configuration and Utilities
// TODO: Replace with actual backend URL in production
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://192.168.1.5:8000';

// API Client with error handling
class ApiClient {
  constructor(baseURL = BACKEND_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // TODO: Add authentication token to headers
  getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { ...this.defaultHeaders, Authorization: `Bearer ${token}` } : this.defaultHeaders;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      // Return mock data for demo purposes
      return this.getMockResponse(endpoint, options.method || 'GET');
    }
  }

  // Mock responses for demo
  getMockResponse(endpoint, method) {
    const mockData = {
      '/api/v1/features': {
        features: [
          {
            id: 1,
            title: 'Previous Year Papers',
            description: 'Access thousands of previous year question papers',
            icon: '📘',
            enabled: true
          },
          {
            id: 2,
            title: 'AI Study Assistant',
            description: 'Get personalized study recommendations',
            icon: '🤖',
            enabled: true
          },
          {
            id: 3,
            title: 'Predictive Analysis',
            description: 'Predict important topics for upcoming exams',
            icon: '🎯',
            enabled: false
          },
          {
            id: 4,
            title: 'Offline Access',
            description: 'Download papers for offline study',
            icon: '✅',
            enabled: true
          }
        ]
      },
      '/api/v1/papers': {
        papers: [
          {
            id: 1,
            title: 'Computer Science  - Data Structures',
            subject: 'Data Structures',
            stream: 'Computer Science',
            year: 2023,
            semester: 'III',
            university: 'Osmania University',
            tags: ['algorithms', 'trees', 'graphs'],
            uploadedBy: 'student@example.com',
            uploadedAt: '2023-12-01T10:00:00Z',
            fileUrl: '/mock/paper1.pdf',
            status: 'approved'
          },
          {
            id: 2,
            title: 'Mathematics - Calculus and Differential Equations',
            subject: 'Mathematics',
            stream: 'bca',
            year: 2023,
            semester: 'II',
            university: 'Osmania University',
            tags: ['calculus', 'differential', 'integration'],
            uploadedBy: 'math.student@example.com',
            uploadedAt: '2023-11-28T14:30:00Z',
            fileUrl: '/mock/paper2.pdf',
            status: 'approved'
          }
        ],
        total: 2,
        page: 1,
        limit: 10
      }
    };

    return mockData[endpoint] || { message: 'Mock response', endpoint, method };
  }

  // API Methods
  async getFeatures() {
    return this.request('/api/v1/features');
  }

  async getPapers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/v1/papers?${queryString}`);
  }

  async searchPapers(query = '', filters = {}) {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/v1/papers?${queryString}`);
  }

  async getPaperById(id) {
    return this.request(`/api/v1/papers/${id}`);
  }

  async authorizePaperDownload(id) {
    // TODO: Implement actual authorization
    return this.request(`/api/v1/papers/${id}/authorize`, { method: 'GET' });
  }

  async stampPaper(id, watermarkData) {
    // TODO: Implement actual watermark stamping
    return this.request(`/api/v1/papers/${id}/stamp`, {
      method: 'POST',
      body: JSON.stringify(watermarkData)
    });
  }

  async uploadPaper(formData) {
    // TODO: Implement actual file upload
    return this.request('/api/v1/papers', {
      method: 'POST',
      headers: {}, // Don't set Content-Type for FormData
      body: formData
    });
  }

  async sendChatMessage(message, sessionId) {
    // TODO: Implement actual chat API
    return this.request('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId })
    });
  }

  // Server-Sent Events for chat
  createChatStream(sessionId) {
    // TODO: Implement actual SSE connection
    const mockEventSource = {
      onmessage: null,
      onerror: null,
      close: () => {},
      addEventListener: (event, handler) => {
        if (event === 'message') {
          // Simulate typing and response
          setTimeout(() => {
            handler({
              data: JSON.stringify({
                type: 'typing',
                content: ''
              })
            });
          }, 500);
          
          setTimeout(() => {
            handler({
              data: JSON.stringify({
                type: 'message',
                content: 'This is a mock response from the AI assistant. In production, this would connect to the actual chat API.',
                timestamp: new Date().toISOString()
              })
            });
          }, 2000);
        }
      }
    };
    
    return mockEventSource;
  }
}

// Export singleton instance
export const api = new ApiClient();
export const apiClient = api; // Alias for compatibility

// Export individual methods for convenience
export const {
  getFeatures,
  getPapers,
  searchPapers,
  getPaperById,
  authorizePaperDownload,
  stampPaper,
  uploadPaper,
  sendChatMessage,
  createChatStream
} = api;

export default api;