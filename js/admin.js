// Project: QuizMaster - Developed by NHÓM 3-FIT-DNU

document.addEventListener('DOMContentLoaded', () => {
  // ==================== 1. KIỂM TRA BẢO MẬT PHÂN QUYỀN (CLIENT SIDE) ====================
  const currentUser = window.QuizSession.get();
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  // Cập nhật tên Admin trên Navbar
  const adminHeaderName = document.getElementById('adminHeaderName');
  if (adminHeaderName) {
    adminHeaderName.textContent = currentUser.fullName;
  }

  // Đăng xuất admin
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  adminLogoutBtn.addEventListener('click', () => {
    window.QuizSession.clear();
    window.location.href = 'index.html';
  });

  // Chuyển đổi Dark/Light Mode
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    window.QuizTheme.toggle();
  });

  // ==================== KHAI BÁO BIẾN TOÀN CỤC PHÂN HỆ ADMIN ====================
  let currentAdminTopic = null; // Đối tượng chủ đề đang được chọn và sửa đổi
  
  // DOM Elements
  const adminTopicSelect = document.getElementById('adminTopicSelect');
  const editTopicBtn = document.getElementById('editTopicBtn');
  const addTopicBtn = document.getElementById('addTopicBtn');
  const addNewQuestionBtn = document.getElementById('addNewQuestionBtn');
  const adminLiveSearch = document.getElementById('adminLiveSearch');
  const questionsTableBody = document.getElementById('questionsTableBody');
  const questionCountBadge = document.getElementById('questionCountBadge');

  // Topic Form elements
  const topicFormModalEl = document.getElementById('topicFormModal');
  const topicFormModal = new bootstrap.Modal(topicFormModalEl);
  const topicForm = document.getElementById('topicForm');
  const editingTopicId = document.getElementById('editingTopicId');
  const topicNameInput = document.getElementById('topicNameInput');
  const topicDescInput = document.getElementById('topicDescInput');
  const topicTimeLimitInput = document.getElementById('topicTimeLimitInput');

  const questionFormModalEl = document.getElementById('questionFormModal');
  const questionFormModal = new bootstrap.Modal(questionFormModalEl);
  const questionForm = document.getElementById('questionForm');
  
  const editingQuestionId = document.getElementById('editingQuestionId');
  const qText = document.getElementById('qText');
  const qOptA = document.getElementById('qOptA');
  const qOptB = document.getElementById('qOptB');
  const qOptC = document.getElementById('qOptC');
  const qOptD = document.getElementById('qOptD');
  const qCorrectA = document.getElementById('qCorrectA');
  const qCorrectB = document.getElementById('qCorrectB');
  const qCorrectC = document.getElementById('qCorrectC');
  const qCorrectD = document.getElementById('qCorrectD');
  const modalTitle = document.getElementById('questionFormModalLabel');

  // ==================== 2. TẢI DANH SÁCH CHỦ ĐỀ VÀO SELECT SELECTOR ====================
  
  async function loadTopicsToSelect() {
    try {
      const topics = await window.QuizAPI.getTopics();
      
      adminTopicSelect.innerHTML = '<option value="" disabled selected>-- Chọn chủ đề đề thi cần quản lý --</option>';
      
      topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.id;
        option.textContent = `${topic.name} (${topic.questions ? topic.questions.length : 0} câu hỏi)`;
        adminTopicSelect.appendChild(option);
      });

    } catch (err) {
      alert(`Lỗi tải danh sách chủ đề: ${err.message}`);
      adminTopicSelect.innerHTML = '<option value="" disabled>Lỗi tải dữ liệu!</option>';
    }
  }

  // Lắng nghe sự kiện thay đổi chủ đề được chọn
  adminTopicSelect.addEventListener('change', async (e) => {
    const topicId = e.target.value;
    if (!topicId) return;

    // Bật trạng thái các công cụ điều khiển
    addNewQuestionBtn.removeAttribute('disabled');
    editTopicBtn.removeAttribute('disabled');
    adminLiveSearch.removeAttribute('disabled');
    adminLiveSearch.value = ''; // Reset ô tìm kiếm

    await loadTopicQuestions(topicId);
  });

  // Tải danh sách câu hỏi của chủ đề cụ thể
  async function loadTopicQuestions(topicId) {
    try {
      const topic = await window.QuizAPI.getTopicById(topicId);
      currentAdminTopic = topic;
      
      // Đảm bảo mảng questions tồn tại và thực sự là một Array
      if (!Array.isArray(currentAdminTopic.questions)) {
        currentAdminTopic.questions = [];
      }

      renderAdminQuestions(currentAdminTopic.questions);

    } catch (err) {
      alert(`Lỗi tải câu hỏi từ chủ đề: ${err.message}`);
    }
  }

  // ==================== 3. RENDER BẢNG CÂU HỎI & LIVE SEARCH ====================
  
  /**
   * Đổ dữ liệu câu hỏi ra bảng (hỗ trợ hiển thị mảng lọc tìm kiếm)
   * @param {Array} questionsList - Danh sách câu hỏi cần đổ ra bảng
   */
  function renderAdminQuestions(questionsList) {
    // Cập nhật badge số câu hỏi
    questionCountBadge.textContent = `${questionsList.length} câu hỏi`;
    questionsTableBody.innerHTML = '';

    if (questionsList.length === 0) {
      questionsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-5 text-muted fs-5">
            ⚠️ Không tìm thấy câu hỏi nào!
          </td>
        </tr>
      `;
      return;
    }

    questionsList.forEach((q, idx) => {
      const row = document.createElement('tr');
      
      // Format render danh sách các phương án chọn đẹp mắt
      let optionsListHTML = '<ul class="list-unstyled mb-0 small">';
      q.options.forEach(opt => {
        const isCorrect = opt.trim() === q.correctAnswer.trim();
        const boldClass = isCorrect ? 'text-success fw-bold' : '';
        optionsListHTML += `<li class="${boldClass}">${escapeHTML(opt)}</li>`;
      });
      optionsListHTML += '</ul>';

      row.innerHTML = `
        <td class="fw-bold">${idx + 1}</td>
        <td class="fw-medium">${escapeHTML(q.questionText)}</td>
        <td>${optionsListHTML}</td>
        <td>
          <span class="badge bg-success-subtle text-success px-2 py-1">${escapeHTML(q.correctAnswer)}</span>
        </td>
        <td class="text-center">
          <div class="btn-group gap-1">
            <button class="btn btn-outline-primary btn-sm rounded edit-q-btn" data-id="${q.id}">Sửa</button>
            <button class="btn btn-outline-danger btn-sm rounded delete-q-btn" data-id="${q.id}">Xóa</button>
          </div>
        </td>
      `;

      questionsTableBody.appendChild(row);
    });

    // Đăng ký sự kiện nút sửa câu hỏi
    document.querySelectorAll('.edit-q-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qId = e.target.getAttribute('data-id');
        openEditQuestionModal(qId);
      });
    });

    // Đăng ký sự kiện nút xóa câu hỏi
    document.querySelectorAll('.delete-q-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qId = e.target.getAttribute('data-id');
        handleDeleteQuestion(qId);
      });
    });
  }

  // Logic Tìm kiếm nhanh (Live Search) trực tiếp trên Client
  adminLiveSearch.addEventListener('input', (e) => {
    if (!currentAdminTopic || !currentAdminTopic.questions) return;
    
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
      renderAdminQuestions(currentAdminTopic.questions);
      return;
    }

    // Lọc các câu hỏi khớp với từ khóa trong nội dung hoặc phương án chọn
    const filteredQuestions = currentAdminTopic.questions.filter(q => {
      const matchText = q.questionText.toLowerCase().includes(query);
      const matchOptions = q.options.some(opt => opt.toLowerCase().includes(query));
      return matchText || matchOptions;
    });

    renderAdminQuestions(filteredQuestions);
  });

  // ==================== 4. CRUD CÂU HỎI (THÊM, SỬA, XÓA) ====================
  
  // Chuẩn hóa và tự động thêm tiền tố A., B., C., D. cho đáp án
  function formatOption(prefix, text) {
    let cleaned = text.trim();
    // Biểu thức Regex loại bỏ tiền tố A., B., C., D. nếu admin nhập thừa
    const regex = new RegExp(`^${prefix}\\.?\\s*`, 'i');
    cleaned = cleaned.replace(regex, '');
    return `${prefix}. ${cleaned}`;
  }

  // A. Thao tác Mở Modal Thêm mới câu hỏi
  addNewQuestionBtn.addEventListener('click', () => {
    questionForm.reset();
    editingQuestionId.value = ''; // Xóa ID cũ
    
    // Đảm bảo bỏ chọn các checkbox đáp án đúng
    qCorrectA.checked = false;
    qCorrectB.checked = false;
    qCorrectC.checked = false;
    qCorrectD.checked = false;
    
    modalTitle.textContent = 'Thêm câu hỏi mới';
    modalTitle.className = 'modal-title fw-bold text-white';
    
    questionFormModal.show();
  });

  // B. Thao tác Mở Modal Cập nhật câu hỏi
  function openEditQuestionModal(qId) {
    const q = currentAdminTopic.questions.find(item => item.id === qId);
    if (!q) return;

    // Đưa dữ liệu cũ vào Form
    editingQuestionId.value = q.id;
    qText.value = q.questionText;

    // Loại bỏ tiền tố khi điền vào Form sửa để quản trị viên nhập liệu tự nhiên
    const stripPrefix = (prefix, text) => {
      const regex = new RegExp(`^${prefix}\\.?\\s*`, 'i');
      return text.replace(regex, '').trim();
    };

    qOptA.value = q.options[0] ? stripPrefix('A', q.options[0]) : '';
    qOptB.value = q.options[1] ? stripPrefix('B', q.options[1]) : '';
    qOptC.value = q.options[2] ? stripPrefix('C', q.options[2]) : '';
    qOptD.value = q.options[3] ? stripPrefix('D', q.options[3]) : '';

    // Reset các checkbox đáp án đúng
    qCorrectA.checked = false;
    qCorrectB.checked = false;
    qCorrectC.checked = false;
    qCorrectD.checked = false;

    const cleanCorrect = q.correctAnswer.trim();
    
    // 1. Kiểm tra định dạng chuỗi các chữ cái phân tách bằng dấu phẩy (Ví dụ: "A, C" hoặc "B")
    const letterRegex = /^[A-D](\s*,\s*[A-D])*$/;
    if (letterRegex.test(cleanCorrect)) {
      const letters = cleanCorrect.split(',').map(l => l.trim());
      if (letters.includes('A')) qCorrectA.checked = true;
      if (letters.includes('B')) qCorrectB.checked = true;
      if (letters.includes('C')) qCorrectC.checked = true;
      if (letters.includes('D')) qCorrectD.checked = true;
    } else {
      // 2. Định dạng kiểu cũ (so khớp toàn bộ chuỗi nội dung của từng Option)
      if (q.options[0] && cleanCorrect === q.options[0].trim()) qCorrectA.checked = true;
      if (q.options[1] && cleanCorrect === q.options[1].trim()) qCorrectB.checked = true;
      if (q.options[2] && cleanCorrect === q.options[2].trim()) qCorrectC.checked = true;
      if (q.options[3] && cleanCorrect === q.options[3].trim()) qCorrectD.checked = true;
    }

    modalTitle.textContent = 'Cập nhật câu hỏi';
    modalTitle.className = 'modal-title fw-bold text-white';
    
    questionFormModal.show();
  }

  // C. Xử lý Submit Form (Lưu thêm mới / Cập nhật sửa đổi)
  questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentAdminTopic) return;

    // 1. Lấy thông tin nhập liệu và tự động làm sạch
    const questionTextVal = qText.value.trim();
    const optAVal = formatOption('A', qOptA.value);
    const optBVal = formatOption('B', qOptB.value);
    const optCVal = formatOption('C', qOptC.value);
    const optDVal = formatOption('D', qOptD.value);

    // Thu thập các chữ cái đáp án đúng được tích chọn
    const selectedCorrectLetters = [];
    if (qCorrectA.checked) selectedCorrectLetters.push('A');
    if (qCorrectB.checked) selectedCorrectLetters.push('B');
    if (qCorrectC.checked) selectedCorrectLetters.push('C');
    if (qCorrectD.checked) selectedCorrectLetters.push('D');

    if (selectedCorrectLetters.length === 0) {
      alert('⚠️ Vui lòng tích chọn ít nhất 1 phương án đáp án đúng!');
      return;
    }

    // Ghép các đáp án đúng thành chuỗi dạng "A, C"
    const correctAnswerVal = selectedCorrectLetters.join(', ');
    const qIdVal = editingQuestionId.value;

    // 2. Chế độ Thêm mới hay Cập nhật
    if (qIdVal === '') {
      // THÊM MỚI CÂU HỎI
      const newQuestion = {
        id: 'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000), // ID duy nhất
        questionText: questionTextVal,
        options: [optAVal, optBVal, optCVal, optDVal],
        correctAnswer: correctAnswerVal
      };

      currentAdminTopic.questions.push(newQuestion);
    } else {
      // CẬP NHẬT CÂU HỎI ĐÃ CÓ
      const qIdx = currentAdminTopic.questions.findIndex(item => item.id === qIdVal);
      if (qIdx === -1) {
        alert('Lỗi: Không tìm thấy câu hỏi cần cập nhật!');
        return;
      }

      currentAdminTopic.questions[qIdx] = {
        id: qIdVal,
        questionText: questionTextVal,
        options: [optAVal, optBVal, optCVal, optDVal],
        correctAnswer: correctAnswerVal
      };
    }

    // 3. Đồng bộ hóa đẩy đè lên MockAPI
    try {
      await window.QuizAPI.updateTopicData(currentAdminTopic.id, currentAdminTopic);
      
      alert(qIdVal === '' ? 'Thêm câu hỏi mới thành công!' : 'Cập nhật câu hỏi thành công!');
      questionFormModal.hide();
      
      // Tải lại dữ liệu mới nhất từ Server để đồng bộ và re-render bảng
      await loadTopicQuestions(currentAdminTopic.id);
      
      // Cập nhật lại số câu hỏi trên Select dropdown hiển thị
      loadTopicsToSelect().then(() => {
        adminTopicSelect.value = currentAdminTopic.id;
      });

    } catch (err) {
      alert(`Đồng bộ lên MockAPI thất bại: ${err.message}. Vui lòng thử lại!`);
    }
  });

  // D. Xử lý Xóa câu hỏi
  async function handleDeleteQuestion(qId) {
    if (!currentAdminTopic) return;

    const q = currentAdminTopic.questions.find(item => item.id === qId);
    if (!q) return;

    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa câu hỏi này không?\n\n"${q.questionText}"`);
    if (!confirmDelete) return;

    // Lọc loại bỏ câu hỏi ra khỏi mảng
    currentAdminTopic.questions = currentAdminTopic.questions.filter(item => item.id !== qId);

    // Đồng bộ lên MockAPI
    try {
      await window.QuizAPI.updateTopicData(currentAdminTopic.id, currentAdminTopic);
      
      alert('Đã xóa câu hỏi thành công!');
      
      // Tải lại câu hỏi từ Server
      await loadTopicQuestions(currentAdminTopic.id);

      // Cập nhật lại dropdown danh sách chủ đề hiển thị số lượng câu hỏi mới
      loadTopicsToSelect().then(() => {
        adminTopicSelect.value = currentAdminTopic.id;
      });

    } catch (err) {
      alert(`Xóa câu hỏi thất bại: ${err.message}`);
    }
  }

  // ==================== 5. QUẢN LÝ TẠO ADMIN MỚI ====================
  const createAdminModalEl = document.getElementById('createAdminModal');
  const createAdminModal = new bootstrap.Modal(createAdminModalEl);
  const openCreateAdminModalBtn = document.getElementById('openCreateAdminModalBtn');
  const createAdminForm = document.getElementById('createAdminForm');
  const createAdminErrorMsg = document.getElementById('createAdminErrorMsg');

  if (openCreateAdminModalBtn) {
    openCreateAdminModalBtn.addEventListener('click', () => {
      createAdminForm.reset();
      createAdminErrorMsg.classList.add('d-none');
      createAdminModal.show();
    });
  }

  if (createAdminForm) {
    createAdminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      createAdminErrorMsg.classList.add('d-none');

      const fullName = document.getElementById('adminFullName').value.trim();
      const username = document.getElementById('adminUsername').value.trim();
      const password = document.getElementById('adminPassword').value;

      if (password.length < 6) {
        createAdminErrorMsg.textContent = 'Mật khẩu của Admin mới phải chứa ít nhất 6 ký tự!';
        createAdminErrorMsg.classList.remove('d-none');
        return;
      }

      try {
        await window.QuizAPI.register({
          fullName,
          username,
          password,
          role: 'admin' // Tự động gán quyền admin bảo mật
        });

        alert(`👑 Đã tạo thành công tài khoản quản trị viên mới:\n\nTên đăng nhập: ${username}\nHọ tên: ${fullName}`);
        createAdminForm.reset();
        createAdminModal.hide();
      } catch (err) {
        createAdminErrorMsg.textContent = err.message || 'Lỗi đăng ký tài khoản admin mới!';
        createAdminErrorMsg.classList.remove('d-none');
      }
    });
  }

  // ==================== 6. QUẢN LÝ THÊM MỚI & CHỈNH SỬA CHỦ ĐỀ ====================
  if (addTopicBtn) {
    addTopicBtn.addEventListener('click', () => {
      topicForm.reset();
      editingTopicId.value = ''; // Mode thêm mới
      document.getElementById('topicFormModalLabel').textContent = '➕ Thêm chủ đề thi mới';
      topicFormModal.show();
    });
  }

  if (editTopicBtn) {
    editTopicBtn.addEventListener('click', () => {
      if (!currentAdminTopic) return;
      editingTopicId.value = currentAdminTopic.id; // Mode cập nhật
      document.getElementById('topicFormModalLabel').textContent = '📝 Chỉnh sửa thông tin chủ đề';
      topicNameInput.value = currentAdminTopic.name;
      topicDescInput.value = currentAdminTopic.description || '';
      topicTimeLimitInput.value = currentAdminTopic.timeLimit;
      topicFormModal.show();
    });
  }

  if (topicForm) {
    topicForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newName = topicNameInput.value.trim();
      const newDesc = topicDescInput.value.trim();
      const newTimeLimit = parseInt(topicTimeLimitInput.value);
      const topicIdVal = editingTopicId.value;

      if (newTimeLimit < 10) {
        alert('Thời gian làm bài tối thiểu phải từ 10 giây trở lên!');
        return;
      }

      if (topicIdVal === '') {
        // CHẾ ĐỘ THÊM MỚI CHỦ ĐỀ THI
        const newTopic = {
          name: newName,
          description: newDesc,
          timeLimit: newTimeLimit,
          questions: [] // Khởi tạo mảng câu hỏi rỗng an toàn
        };

        try {
          const createdTopic = await window.QuizAPI.createTopic(newTopic);
          alert(`➕ Thêm chủ đề thi mới "${newName}" thành công!`);
          topicFormModal.hide();

          // Tải lại select dropdown và tự động kích hoạt chọn chủ đề mới vừa tạo
          await loadTopicsToSelect();
          adminTopicSelect.value = createdTopic.id;
          
          // Tạo và phát sự kiện change để tải bảng câu hỏi rỗng và bật các công cụ điều khiển
          adminTopicSelect.dispatchEvent(new Event('change'));

        } catch (err) {
          alert(`Thêm chủ đề mới thất bại: ${err.message}`);
        }
      } else {
        // CHẾ ĐỘ CẬP NHẬT CHỦ ĐỀ THI ĐÃ CÓ
        if (!currentAdminTopic) return;
        currentAdminTopic.name = newName;
        currentAdminTopic.description = newDesc;
        currentAdminTopic.timeLimit = newTimeLimit;

        try {
          await window.QuizAPI.updateTopicData(currentAdminTopic.id, currentAdminTopic);
          alert('📝 Cập nhật thông tin chủ đề thành công!');
          topicFormModal.hide();

          // Đồng bộ danh mục dropdown select hiển thị tên chủ đề mới
          await loadTopicsToSelect();
          adminTopicSelect.value = currentAdminTopic.id;

        } catch (err) {
          alert(`Cập nhật thông tin chủ đề thất bại: ${err.message}`);
        }
      }
    });
  }

  // ==================== TIỆN ÍCH HỖ TRỢ ====================
  
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==================== KHỞI CHẠY PHÂN HỆ ADMIN ====================
  loadTopicsToSelect();
});
