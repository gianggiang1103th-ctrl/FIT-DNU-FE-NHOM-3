// Project: QuizMaster - Developed by NHÓM 3-FIT-DNU

const BASE_URL = 'https://69f9a6d5c509a40d3aa2efcf.mockapi.io/api/v1';

/**
 * Hàm chung dùng để gọi Fetch API tích hợp tự động hiển thị/ẩn Spinner.
 * @param {string} endpoint - Endpoint cần gọi (ví dụ: '/users', '/topics')
 * @param {object} options - Các tùy chọn của fetch (method, headers, body,...)
 */
async function apiRequest(endpoint, options = {}) {
  // Bật spinner toàn màn hình nếu hàm có sẵn trong global
  if (typeof window.showSpinner === 'function') {
    window.showSpinner();
  }
  
  const url = `${BASE_URL}${endpoint}`;
  
  // Tự động thêm header Content-Type nếu có body và chưa khai báo header
  if (options.body && !options.headers) {
    options.headers = {
      'Content-Type': 'application/json'
    };
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi kết nối API (${response.status}): ${errorText || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Lỗi gọi API tới ${url}:`, error);
    throw error;
  } finally {
    // Tắt spinner toàn màn hình khi có kết quả hoặc có lỗi xảy ra
    if (typeof window.hideSpinner === 'function') {
      window.hideSpinner();
    }
  }
}

// Xuất các API cụ thể ra đối tượng toàn cục
window.QuizAPI = {
  // ==================== AUTHENTICATION API ====================
  
  /**
   * Lấy danh sách tất cả người dùng từ hệ thống
   */
  async getUsers() {
    return await apiRequest('/users');
  },

  /**
   * Đăng ký tài khoản học sinh hoặc quản trị viên mới
   * @param {object} userData - Thông tin người dùng { username, password, fullName, role }
   */
  async register(userData) {
    // Kiểm tra xem username đã tồn tại chưa trước khi đăng ký
    const users = await this.getUsers();
    const isExisted = users.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
    
    if (isExisted) {
      throw new Error('Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác!');
    }
    
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  /**
   * Đăng nhập người dùng bằng cách đối chiếu thông tin tài khoản
   * @param {string} username - Tên tài khoản đăng nhập
   * @param {string} password - Mật khẩu đăng nhập
   */
  async login(username, password) {
    const users = await this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Tên tài khoản hoặc mật khẩu không chính xác!');
    }
    
    return user;
  },

  // ==================== QUIZ & TOPICS API ====================

  /**
   * Lấy danh sách tất cả chủ đề đề thi
   */
  async getTopics() {
    return await apiRequest('/topics');
  },

  /**
   * Lấy chi tiết chủ đề thi kèm mảng questions lồng bên trong theo ID
   * @param {string} id - ID của chủ đề thi
   */
  async getTopicById(id) {
    return await apiRequest(`/topics/${id}`);
  },

  /**
   * Cập nhật đè dữ liệu của chủ đề thi (Dùng chung cho cả Thêm, Sửa, Xóa câu hỏi)
   * @param {string} id - ID của chủ đề cần cập nhật
   * @param {object} fullTopicData - Toàn bộ dữ liệu mới của chủ đề (đã cập nhật mảng questions)
   */
  async updateTopicData(id, fullTopicData) {
    return await apiRequest(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fullTopicData)
    });
  },

  /**
   * Tạo một chủ đề thi hoàn toàn mới
   * @param {object} topicData - Thông tin chủ đề { name, description, timeLimit, questions: [] }
   */
  async createTopic(topicData) {
    return await apiRequest('/topics', {
      method: 'POST',
      body: JSON.stringify(topicData)
    });
  },

  /**
   * Cập nhật thông tin chi tiết người dùng (Lưu lịch sử thi)
   * @param {string} id - ID người dùng
   * @param {object} fullUserData - Đối tượng người dùng đã cập nhật mảng history
   */
  async updateUserData(id, fullUserData) {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fullUserData)
    });
  }
};
