// Project: QuizMaster - Developed by NHÓM 3-FIT-DNU

document.addEventListener('DOMContentLoaded', () => {
  // ==================== KHAI BÁO BIẾN TOÀN CỤC PHÂN HỆ THI ====================
  let currentTopic = null;
  let shuffledQuestions = [];
  let userAnswers = {}; // Lưu trữ: { questionId: selectedOptionText }
  let examTimer = null;
  let timeRemaining = 0;
  let timeLimit = 0;
  let isSubmitted = false;

  // Lấy các element DOM quan trọng
  const authContextZone = document.getElementById('authContextZone');
  const topicsGrid = document.getElementById('topicsGrid');
  const homeView = document.getElementById('homeView');
  const quizView = document.getElementById('quizView');
  
  const quizTopicTitle = document.getElementById('quizTopicTitle');
  const quizTopicDesc = document.getElementById('quizTopicDesc');
  const countdownDisplay = document.getElementById('countdownDisplay');
  const timeProgressBar = document.getElementById('timeProgressBar');
  const questionsContainer = document.getElementById('questionsContainer');
  const questionPalette = document.getElementById('questionPalette');
  
  const submitQuizPaletteBtn = document.getElementById('submitQuizPaletteBtn');
  const submitQuizBottomBtn = document.getElementById('submitQuizBottomBtn');
  const exitQuizBtn = document.getElementById('exitQuizBtn');

  // ==================== 1. QUẢN LÝ PHIÊN ĐĂNG NHẬP & AUTH UI ====================
  
  // Khởi tạo trạng thái Đăng nhập/Đăng ký trên Navbar và Sidebar Offcanvas mới
  function renderAuthContext() {
    const currentUser = window.QuizSession.get();
    const mainNavLinks = document.getElementById('mainNavLinks');
    
    // Elements của Sidebar mới
    const sidebarLoginItem = document.getElementById('sidebarLoginItem');
    const sidebarAdminItem = document.getElementById('sidebarAdminItem');
    const sidebarAuthBtnZone = document.getElementById('sidebarAuthBtnZone');
    
    if (currentUser) {
      // --- PHẦN LOGIC NAVBAR CŨ (Duy trì tính tương thích) ---
      if (mainNavLinks) mainNavLinks.style.display = 'flex';
      const adminLink = currentUser.role === 'admin' 
        ? `<a href="admin.html" class="btn btn-warning btn-sm fw-bold">⚙ Quản trị viên</a>` 
        : '';
        
      authContextZone.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <span class="navbar-text me-2">
            Chào, <a href="#" id="navbarProfileLink" class="text-primary fw-bold text-decoration-none" style="border-bottom: 1px dashed var(--primary-color); padding-bottom: 1px; transition: color 0.2s ease, border-color 0.2s ease;">${currentUser.fullName}</a> 
            <span class="badge bg-secondary text-capitalize">${currentUser.role === 'admin' ? 'Admin' : 'Học sinh'}</span>
          </span>
          ${adminLink}
          <button id="logoutBtn" class="btn btn-outline-danger btn-sm">Đăng xuất</button>
        </div>
      `;

      const profileLink = document.getElementById('navbarProfileLink');
      if (profileLink) {
        profileLink.addEventListener('click', (e) => {
          e.preventDefault();
          showTab('profile');
        });
      }
      
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          window.QuizSession.clear();
          renderAuthContext();
          loadTopics();
          goBackToHome();
        });
      }

      // --- PHẦN LOGIC SIDEBAR MỚI (Mockup Design) ---
      // 1. Thay thế mục Đăng nhập thành tên chào User dẫn đến Profile
      if (sidebarLoginItem) {
        sidebarLoginItem.innerHTML = `
          <a class="nav-link sidebar-link d-flex align-items-center gap-3" href="#" id="sidebarProfileBtn">
            <i class="bi bi-person-circle fs-5 icon-orange"></i>
            <span class="text-truncate">Chào, <strong class="text-primary">${escapeHTML(currentUser.fullName)}</strong></span>
          </a>
        `;
        const sidebarProfileBtn = document.getElementById('sidebarProfileBtn');
        if (sidebarProfileBtn) {
          sidebarProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
            showTab('profile');
          });
        }
      }

      // 2. Hiển thị mục Admin nếu user có quyền
      if (sidebarAdminItem) {
        if (currentUser.role === 'admin') {
          sidebarAdminItem.classList.remove('d-none');
        } else {
          sidebarAdminItem.classList.add('d-none');
        }
      }

      // 3. Đổi nút "Đăng ký ngay" thành "Đăng xuất" màu đỏ cao cấp
      if (sidebarAuthBtnZone) {
        sidebarAuthBtnZone.innerHTML = `
          <button class="btn w-100 sidebar-register-btn d-flex align-items-center justify-content-center gap-2 py-3 bg-danger" id="sidebarLogoutBtn" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important; box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3) !important;">
            <i class="bi bi-box-arrow-right fs-5"></i>
            <span>Đăng xuất</span>
          </button>
        `;
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        if (sidebarLogoutBtn) {
          sidebarLogoutBtn.addEventListener('click', () => {
            closeSidebar();
            window.QuizSession.clear();
            renderAuthContext();
            loadTopics();
            goBackToHome();
          });
        }
      }

    } else {
      // --- PHẦN LOGIC NAVBAR CŨ (Duy trì tính tương thích) ---
      if (mainNavLinks) mainNavLinks.style.display = 'none';
      authContextZone.innerHTML = `
        <button class="btn btn-outline-primary btn-sm px-3" data-bs-toggle="modal" data-bs-target="#loginModal">Đăng nhập</button>
        <button class="btn btn-primary btn-sm px-3" data-bs-toggle="modal" data-bs-target="#registerModal">Đăng ký</button>
      `;

      // --- PHẦN LOGIC SIDEBAR MỚI (Mockup Design) ---
      // 1. Reset mục Đăng nhập
      if (sidebarLoginItem) {
        sidebarLoginItem.innerHTML = `
          <a class="nav-link sidebar-link d-flex align-items-center gap-3" href="#" id="sidebarLoginBtn">
            <i class="bi bi-box-arrow-in-right fs-5 icon-orange"></i>
            <span>Đăng nhập</span>
          </a>
        `;
        const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
        if (sidebarLoginBtn) {
          sidebarLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
          });
        }
      }

      // 2. Ẩn mục Admin
      if (sidebarAdminItem) {
        sidebarAdminItem.classList.add('d-none');
      }

      // 3. Reset nút Đăng ký ngay màu cam vàng
      if (sidebarAuthBtnZone) {
        sidebarAuthBtnZone.innerHTML = `
          <button class="btn w-100 sidebar-register-btn d-flex align-items-center justify-content-center gap-2 py-3" id="sidebarRegisterBtn">
            <i class="bi bi-person-plus fs-5"></i>
            <span>Đăng ký ngay</span>
          </button>
        `;
        const sidebarRegisterBtn = document.getElementById('sidebarRegisterBtn');
        if (sidebarRegisterBtn) {
          sidebarRegisterBtn.addEventListener('click', () => {
            closeSidebar();
            const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
            registerModal.show();
          });
        }
      }
    }
  }

  // Đăng ký sự kiện đổi theme Dark Mode
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    window.QuizTheme.toggle();
  });

  // Lắng nghe submit Form Đăng nhập
  const loginForm = document.getElementById('loginForm');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const loginModalEl = document.getElementById('loginModal');
  const loginModal = new bootstrap.Modal(loginModalEl);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorMsg.classList.add('d-none');
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    try {
      const user = await window.QuizAPI.login(username, password);
      window.QuizSession.save(user);
      
      // Thành công: Đóng modal, reset form, re-render
      loginForm.reset();
      loginModal.hide();
      renderAuthContext();
      loadTopics();
    } catch (err) {
      loginErrorMsg.textContent = err.message || 'Lỗi đăng nhập không xác định!';
      loginErrorMsg.classList.remove('d-none');
    }
  });

  // Lắng nghe submit Form Đăng ký
  const registerForm = document.getElementById('registerForm');
  const registerErrorMsg = document.getElementById('registerErrorMsg');
  const registerModalEl = document.getElementById('registerModal');
  const registerModal = new bootstrap.Modal(registerModalEl);

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerErrorMsg.classList.add('d-none');
    
    const fullName = document.getElementById('registerFullName').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = 'student'; // Mặc định tài khoản đăng ký ngoài trang chủ luôn là Học sinh
    
    if (password.length < 6) {
      registerErrorMsg.textContent = 'Mật khẩu phải chứa ít nhất 6 ký tự!';
      registerErrorMsg.classList.remove('d-none');
      return;
    }

    try {
      const newUser = await window.QuizAPI.register({ fullName, username, password, role });
      
      // Đăng ký thành công: Tự động đăng nhập luôn
      window.QuizSession.save(newUser);
      
      registerForm.reset();
      registerModal.hide();
      alert('Chúc mừng! Bạn đã đăng ký tài khoản thành công.');
      renderAuthContext();
      loadTopics();
    } catch (err) {
      registerErrorMsg.textContent = err.message || 'Lỗi đăng ký không xác định!';
      registerErrorMsg.classList.remove('d-none');
    }
  });

  // ==================== 2. TẢI DANH SÁCH CHỦ ĐỀ (HOME VIEW) ====================
  
  async function loadTopics() {
    topicsGrid.innerHTML = `
      <div class="col-12 text-center my-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Đang tải danh sách chủ đề thi...</p>
      </div>
    `;

    try {
      const topics = await window.QuizAPI.getTopics();
      
      // Đồng thời tải Bảng xếp hạng Cao thủ bên phải
      loadLeaderboard();
      
      if (!topics || topics.length === 0) {
        topicsGrid.innerHTML = `
          <div class="col-12 alert alert-warning text-center" role="alert">
            Hiện tại chưa có chủ đề thi nào được tạo trên hệ thống!
          </div>
        `;
        return;
      }

      topicsGrid.innerHTML = '';
      
      topics.forEach(topic => {
        const qCount = topic.questions ? topic.questions.length : 0;
        const minutes = Math.floor(topic.timeLimit / 60);
        const seconds = topic.timeLimit % 60;
        const timeDisplay = `${minutes} phút ${seconds > 0 ? seconds + ' giây' : ''}`;

        const cardCol = document.createElement('div');
        cardCol.className = 'col-md-6 col-lg-4';
        cardCol.innerHTML = `
          <div class="card h-100 custom-card">
            <div class="card-body p-4 d-flex flex-column">
              <span class="badge bg-primary-subtle text-primary mb-2 align-self-start fw-bold">
                ${qCount} câu hỏi
              </span>
              <h3 class="card-title h5 fw-bold mb-2">${escapeHTML(topic.name)}</h3>
              <p class="card-text text-muted mb-4 flex-grow-1">${escapeHTML(topic.description || 'Chưa có mô tả cụ thể.')}</p>
              
              <div class="border-top pt-3 mt-auto d-flex justify-content-between align-items-center text-secondary small">
                <span>⏱️ ${timeDisplay}</span>
                <button class="btn btn-primary btn-sm px-3 fw-bold start-quiz-btn" data-id="${topic.id}">
                  Bắt đầu làm bài »
                </button>
              </div>
            </div>
          </div>
        `;
        
        topicsGrid.appendChild(cardCol);
      });

      // Gắn sự kiện cho các nút bắt đầu
      document.querySelectorAll('.start-quiz-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const topicId = e.target.getAttribute('data-id');
          attemptStartQuiz(topicId);
        });
      });

    } catch (err) {
      topicsGrid.innerHTML = `
        <div class="col-12 alert alert-danger text-center" role="alert">
          Lỗi tải danh sách chủ đề: ${err.message}. Vui lòng thử lại sau!
        </div>
      `;
    }
  }

  // ==================== 3. LUỒNG THI TRẮC NGHIỆM (QUIZ RUNTIME) ====================
  
  // Xác thực trước khi cho làm bài thi
  function attemptStartQuiz(topicId) {
    const currentUser = window.QuizSession.get();
    if (!currentUser) {
      // Yêu cầu đăng nhập trước
      alert('Vui lòng Đăng nhập hoặc Đăng ký để bắt đầu làm bài thi!');
      loginModal.show();
      return;
    }
    
    // Đã đăng nhập, khởi chạy phòng thi
    startQuiz(topicId);
  }

  // Bắt đầu kỳ thi
  async function startQuiz(topicId) {
    try {
      const topic = await window.QuizAPI.getTopicById(topicId);
      
      // Đảm bảo mảng questions tồn tại và thực sự là một Array
      if (!Array.isArray(topic.questions)) {
        topic.questions = [];
      }
      
      if (topic.questions.length === 0) {
        alert('Chủ đề này hiện tại chưa có câu hỏi nào. Vui lòng quay lại sau!');
        return;
      }

      // 1. Reset các biến trạng thái thi
      currentTopic = topic;
      isSubmitted = false;
      userAnswers = {};
      
      // Xáo trộn ngẫu nhiên thứ tự câu hỏi trước khi hiển thị (Copy mảng để không làm hỏng dữ liệu gốc)
      shuffledQuestions = window.shuffleArray(topic.questions);
      
      // Trộn ngẫu nhiên cả thứ tự các phương án lựa chọn trong từng câu hỏi luôn để tạo độ khó cao cấp
      shuffledQuestions.forEach(q => {
        if (q.options && q.options.length > 0) {
          q.shuffledOptions = window.shuffleArray(q.options);
        } else {
          q.shuffledOptions = [];
        }
      });

      timeLimit = parseInt(topic.timeLimit);
      timeRemaining = timeLimit;

      // 2. Chuyển đổi màn hình giao diện
      homeView.classList.add('d-none');
      quizView.classList.remove('d-none');

      // 3. Hiển thị thông tin tiêu đề đề thi
      quizTopicTitle.textContent = escapeHTML(topic.name);
      quizTopicDesc.textContent = escapeHTML(topic.description || 'Chủ đề thi trắc nghiệm trực tuyến.');
      
      // Ẩn nút Thoát xem lại và hiện lại các nút nộp bài
      exitQuizBtn.classList.add('d-none');
      submitQuizPaletteBtn.classList.remove('d-none');
      submitQuizBottomBtn.classList.remove('d-none');

      // 4. Render danh sách câu hỏi và bảng điều hướng
      renderQuizContent();
      
      // 5. Khởi động bộ đếm ngược
      startTimer();

      // Cuộn lên đầu trang
      window.scrollTo(0, 0);

    } catch (err) {
      alert(`Không thể tải thông tin đề thi: ${err.message}`);
    }
  }

  // Render câu hỏi ra giao diện
  function renderQuizContent() {
    questionsContainer.innerHTML = '';
    questionPalette.innerHTML = '';

    shuffledQuestions.forEach((q, index) => {
      const qIndex = index + 1;
      const isMulti = q.correctAnswer && q.correctAnswer.includes(',');
      const inputType = isMulti ? 'checkbox' : 'radio';
      const inputClass = isMulti ? 'quiz-option-checkbox' : 'quiz-option-radio';
      
      // A. Tạo nút Navigator trong Bảng câu hỏi bên cạnh
      const navBtn = document.createElement('a');
      navBtn.href = `#q-card-${q.id}`;
      navBtn.id = `palette-btn-${q.id}`;
      navBtn.className = 'question-nav-btn';
      navBtn.textContent = qIndex;
      navBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const element = document.getElementById(`q-card-${q.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      questionPalette.appendChild(navBtn);

      // B. Tạo Card câu hỏi chi tiết
      const qCard = document.createElement('div');
      qCard.className = 'card custom-card p-4 shadow-sm';
      qCard.id = `q-card-${q.id}`;
      
      let optionsHTML = '';
      q.shuffledOptions.forEach((option, oIdx) => {
        const optionId = `q_${q.id}_opt_${oIdx}`;
        optionsHTML += `
          <div class="position-relative">
            <input type="${inputType}" 
                   name="q_${q.id}" 
                   id="${optionId}" 
                   value="${escapeHTML(option)}" 
                   class="${inputClass}">
            <label for="${optionId}" class="quiz-option" id="label-${q.id}-${oIdx}">
              ${escapeHTML(option)}
            </label>
          </div>
        `;
      });

      qCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
          <h4 class="h5 fw-bold mb-0 text-primary">Câu ${qIndex}</h4>
          <span class="badge bg-secondary-subtle text-secondary">${isMulti ? 'Chọn nhiều đáp án' : 'Chọn 1 đáp án'}</span>
        </div>
        <p class="fw-semibold mb-4 fs-5">${escapeHTML(q.questionText)}</p>
        <div class="quiz-options-group">
          ${optionsHTML}
        </div>
      `;

      questionsContainer.appendChild(qCard);

      // Gắn sự kiện click chọn đáp án cho từng input button trong Card
      q.shuffledOptions.forEach((option, oIdx) => {
        const optionEl = document.getElementById(`q_${q.id}_opt_${oIdx}`);
        if (optionEl) {
          optionEl.addEventListener('change', () => {
            // Phát âm thanh click nhẹ
            if (window.QuizAudio) {
              window.QuizAudio.playClick();
            }

            if (isMulti) {
              const checkedOptionEls = document.querySelectorAll(`input[name="q_${q.id}"]:checked`);
              const selectedValues = Array.from(checkedOptionEls).map(el => el.value);
              userAnswers[q.id] = selectedValues;
            } else {
              userAnswers[q.id] = option;
            }
            
            // Đánh dấu nút tương ứng trên Bảng điều hướng câu hỏi
            const paletteBtn = document.getElementById(`palette-btn-${q.id}`);
            if (paletteBtn) {
              const hasSelection = isMulti ? (userAnswers[q.id] && userAnswers[q.id].length > 0) : !!userAnswers[q.id];
              if (hasSelection) {
                paletteBtn.classList.add('answered');
              } else {
                paletteBtn.classList.remove('answered');
              }
            }
          });
        }
      });
    });
  }

  // Khởi tạo và chạy Timer
  function startTimer() {
    if (examTimer) clearInterval(examTimer);
    
    updateTimerDisplay();

    examTimer = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();

      if (timeRemaining <= 0) {
        clearInterval(examTimer);
        alert('Đã hết thời gian làm bài! Hệ thống tự động nộp bài thi của bạn.');
        submitQuiz();
      }
    }, 1000);
  }

  // Cập nhật trạng thái hiển thị thời gian
  function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    // Định dạng MM:SS
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    countdownDisplay.textContent = timeString;

    // Phát âm thanh tích tắc ở 10 giây cuối cùng
    if (timeRemaining <= 10 && timeRemaining > 0) {
      if (window.QuizAudio) {
        window.QuizAudio.playTick();
      }
    }

    // Tính phần trăm thời gian còn lại
    const percentRemaining = (timeRemaining / timeLimit) * 100;
    timeProgressBar.style.width = `${percentRemaining}%`;

    // Cập nhật màu sắc Progress Bar & nhấp nháy khẩn cấp
    const timerWidget = document.getElementById('timerWidget');
    if (percentRemaining < 20) {
      timeProgressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-danger';
      timerWidget.className = 'timer-container timer-critical';
    } else if (percentRemaining < 50) {
      timeProgressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-warning';
      timerWidget.className = 'timer-container text-warning';
    } else {
      timeProgressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-success';
      timerWidget.className = 'timer-container';
    }
  }

  // ==================== 4. CHẤM ĐIỂM & REVIEW MODE (XEM LẠI) ====================
  
  // Hàm nộp bài thi
  async function submitQuiz() {
    if (isSubmitted) return;
    isSubmitted = true;
    
    // Tắt đồng hồ đếm ngược
    if (examTimer) clearInterval(examTimer);

    // Bật loading spinner trong lúc chấm điểm
    window.showSpinner();

    // 1. Tính toán điểm số
    let correctCount = 0;
    const totalQuestions = shuffledQuestions.length;

    shuffledQuestions.forEach(q => {
      const isMulti = q.correctAnswer && q.correctAnswer.includes(',');
      const userSelected = userAnswers[q.id];

      if (isMulti) {
        // Chấm điểm câu hỏi chọn nhiều đáp án
        const correctLetters = q.correctAnswer.split(',').map(l => l.trim());
        const userSelectedOptions = Array.isArray(userSelected) ? userSelected : [];
        const userSelectedLetters = userSelectedOptions.map(opt => opt.trim().charAt(0));

        const isMatch = correctLetters.length === userSelectedLetters.length &&
                        correctLetters.every(l => userSelectedLetters.includes(l));
        if (isMatch) {
          correctCount++;
        }
      } else {
        // Chấm điểm câu hỏi chọn 1 đáp án (hỗ trợ cả kiểu so khớp nội dung và so khớp chữ cái viết tắt)
        if (userSelected && typeof userSelected === 'string') {
          const cleanUser = userSelected.trim();
          const cleanCorrect = q.correctAnswer.trim();
          
          const isFullMatch = cleanUser === cleanCorrect;
          const isLetterMatch = cleanCorrect.length === 1 && cleanUser.charAt(0) === cleanCorrect;
          
          if (isFullMatch || isLetterMatch) {
            correctCount++;
          }
        }
      }
    });

    // Tính điểm trên thang 10.0
    const rawScore = (correctCount / totalQuestions) * 10;
    const score = Math.round(rawScore * 10) / 10; // Tròn 1 chữ số thập phân

    // Tính thời gian làm bài
    const timeSpentSeconds = timeLimit - timeRemaining;
    const minutesSpent = Math.floor(timeSpentSeconds / 60);
    const secondsSpent = timeSpentSeconds % 60;
    const timeSpentString = `${String(minutesSpent).padStart(2, '0')}:${String(secondsSpent).padStart(2, '0')}`;

    // 2. Điền kết quả vào Modal
    document.getElementById('reportScore').textContent = score.toFixed(1);
    document.getElementById('reportCorrectCount').textContent = `${correctCount}/${totalQuestions}`;
    document.getElementById('reportTimeSpent').textContent = timeSpentString;

    // Tiêu đề & thông điệp động
    const reportTitle = document.getElementById('reportTitle');
    if (score >= 9) {
      reportTitle.textContent = 'Xuất sắc! 🎉';
      reportTitle.className = 'fw-bold mb-3 text-success';
    } else if (score >= 7) {
      reportTitle.textContent = 'Khá tốt! 👍';
      reportTitle.className = 'fw-bold mb-3 text-info';
    } else if (score >= 5) {
      reportTitle.textContent = 'Đạt yêu cầu! 🙂';
      reportTitle.className = 'fw-bold mb-3 text-warning';
    } else {
      reportTitle.textContent = 'Cố gắng hơn nhé! 💪';
      reportTitle.className = 'fw-bold mb-3 text-danger';
    }

    // Hiện/ẩn nút Chứng chỉ (yêu cầu điểm từ 9.0 trở lên)
    const getCertBtn = document.getElementById('getCertificateBtn');
    if (getCertBtn) {
      if (score >= 9.0) {
        getCertBtn.classList.remove('d-none');
      } else {
        getCertBtn.classList.add('d-none');
      }
    }

    // 3. Đồng bộ hóa đẩy lịch sử thi lên MockAPI
    const currentUser = window.QuizSession.get();
    if (currentUser) {
      if (!Array.isArray(currentUser.history)) {
        currentUser.history = [];
      }
      
      currentUser.history.push({
        topicId: currentTopic.id,
        topicName: currentTopic.name,
        score: score,
        timeSpent: timeSpentSeconds,
        timestamp: new Date().toISOString()
      });

      // Lưu lại vào session của trình duyệt
      window.QuizSession.save(currentUser);

      // Đẩy đè đồng bộ lên cơ sở dữ liệu đám mây MockAPI
      try {
        await window.QuizAPI.updateUserData(currentUser.id, currentUser);
      } catch (err) {
        console.error('Lỗi đồng bộ lịch sử luyện thi lên MockAPI:', err);
      }
    }

    // Tắt loading
    window.hideSpinner();

    // 4. Bắn pháo giấy rực rỡ (Confetti) và phát nhạc Victory hoành tráng nếu điểm >= 8.0
    if (score >= 8.0) {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
      if (window.QuizAudio) {
        window.QuizAudio.playVictory();
      }
    } else {
      // Điểm thường -> Phát tiếng ting thành công
      if (window.QuizAudio) {
        window.QuizAudio.playSuccess();
      }
    }

    // 5. Kích hoạt hiện Modal kết quả
    const scoreReportModal = new bootstrap.Modal(document.getElementById('scoreReportModal'));
    scoreReportModal.show();
  }

  // Đăng ký sự kiện cho nút nộp bài
  submitQuizPaletteBtn.addEventListener('click', () => {
    const unansweredCount = shuffledQuestions.length - Object.keys(userAnswers).length;
    let confirmMsg = 'Bạn có chắc chắn muốn nộp bài thi này không?';
    if (unansweredCount > 0) {
      confirmMsg = `Bạn vẫn còn ${unansweredCount} câu hỏi chưa hoàn thành. Bạn có chắc chắn muốn nộp bài ngay không?`;
    }
    if (confirm(confirmMsg)) {
      submitQuiz();
    }
  });

  submitQuizBottomBtn.addEventListener('click', () => {
    submitQuizPaletteBtn.click(); // Gọi lại sự kiện nút palette
  });

  // Xem lại bài thi (Review Mode)
  document.getElementById('viewQuizReviewBtn').addEventListener('click', () => {
    enterReviewMode();
  });

  // Về trang chủ từ bảng điểm
  document.getElementById('backToHomeBtn').addEventListener('click', () => {
    goBackToHome();
  });

  // Vào chế độ Xem lại câu sai
  function enterReviewMode() {
    // Ẩn các nút nộp bài
    submitQuizPaletteBtn.classList.add('d-none');
    submitQuizBottomBtn.classList.add('d-none');
    
    // Hiện nút Thoát
    exitQuizBtn.classList.remove('d-none');

    // Khóa toàn bộ các ô chọn và đánh dấu màu sắc trực quan
    shuffledQuestions.forEach(q => {
      const isMulti = q.correctAnswer && q.correctAnswer.includes(',');
      const userSelected = userAnswers[q.id];
      const correctAns = q.correctAnswer;

      const paletteBtn = document.getElementById(`palette-btn-${q.id}`);
      let isUserCorrect = false;

      if (isMulti) {
        // Xử lý xem lại câu chọn nhiều đáp án
        const correctLetters = correctAns.split(',').map(l => l.trim());
        const userSelectedOptions = Array.isArray(userSelected) ? userSelected : [];
        const userSelectedLetters = userSelectedOptions.map(opt => opt.trim().charAt(0));

        isUserCorrect = correctLetters.length === userSelectedLetters.length &&
                        correctLetters.every(l => userSelectedLetters.includes(l));

        q.shuffledOptions.forEach((option, oIdx) => {
          const optionEl = document.getElementById(`q_${q.id}_opt_${oIdx}`);
          const labelEl = document.getElementById(`label-${q.id}-${oIdx}`);
          
          if (optionEl && labelEl) {
            optionEl.disabled = true;
            labelEl.classList.add('review-locked');

            const optionLetter = option.trim().charAt(0);
            const isThisCorrect = correctLetters.includes(optionLetter);
            const isThisSelected = userSelectedLetters.includes(optionLetter);

            if (isThisCorrect) {
              if (isThisSelected) {
                labelEl.classList.add('review-correct'); // Chọn chuẩn xác
              } else {
                labelEl.classList.add('review-missed'); // Đúng nhưng bị bỏ lỡ
              }
            } else if (isThisSelected) {
              labelEl.classList.add('review-incorrect'); // Chọn sai lệch
            }
          }
        });
      } else {
        // Xử lý xem lại câu chọn 1 đáp án
        const cleanCorrect = correctAns.trim();
        
        if (userSelected && typeof userSelected === 'string') {
          const cleanUser = userSelected.trim();
          isUserCorrect = cleanUser === cleanCorrect || (cleanCorrect.length === 1 && cleanUser.charAt(0) === cleanCorrect);
        }

        q.shuffledOptions.forEach((option, oIdx) => {
          const optionEl = document.getElementById(`q_${q.id}_opt_${oIdx}`);
          const labelEl = document.getElementById(`label-${q.id}-${oIdx}`);
          
          if (optionEl && labelEl) {
            optionEl.disabled = true;
            labelEl.classList.add('review-locked');

            const isThisCorrect = option.trim() === cleanCorrect || (cleanCorrect.length === 1 && option.trim().charAt(0) === cleanCorrect);
            const isThisSelected = userSelected && typeof userSelected === 'string' && (option.trim() === userSelected.trim());

            if (isThisCorrect) {
              if (isThisSelected) {
                labelEl.classList.add('review-correct');
              } else {
                labelEl.classList.add('review-missed');
              }
            } else if (isThisSelected) {
              labelEl.classList.add('review-incorrect');
            }
          }
        });
      }

      // Cập nhật trạng thái màu sắc trên Bảng điều hướng câu hỏi bên cạnh
      if (paletteBtn) {
        paletteBtn.classList.remove('answered');
        if (isUserCorrect) {
          paletteBtn.classList.add('nav-correct');
        } else {
          paletteBtn.classList.add('nav-incorrect');
        }
      }
    });

    // Cuộn lên đầu để xem lại
    window.scrollTo(0, 0);
  }

  // Sự kiện nút Thoát xem lại bài thi
  exitQuizBtn.addEventListener('click', () => {
    goBackToHome();
  });

  // Về trang chủ
  function goBackToHome() {
    if (examTimer) clearInterval(examTimer);
    
    quizView.classList.add('d-none');
    homeView.classList.remove('d-none');
    leaderboardView.classList.add('d-none');
    profileView.classList.add('d-none');
    
    // Xóa các dữ liệu rác
    questionsContainer.innerHTML = '';
    questionPalette.innerHTML = '';
    
    // Đặt lại các trạng thái Active trên Navbar
    if (navLeaderboardBtn) navLeaderboardBtn.classList.remove('active');
    
    // Tải lại danh sách chủ đề
    loadTopics();
    window.scrollTo(0, 0);
  }

  // ==================== 5. BẢNG XẾP HẠNG CAO THỦ (GLOBAL LEADERBOARD) ====================

  async function loadLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    if (!leaderboardList) return;

    try {
      const users = await window.QuizAPI.getUsers();
      
      // Lọc các user có lịch sử thi và tính điểm trung bình tích lũy
      const rankedUsers = users
        .filter(u => Array.isArray(u.history) && u.history.length > 0)
        .map(u => {
          const totalScore = u.history.reduce((sum, h) => sum + h.score, 0);
          const avgScore = totalScore / u.history.length;
          return {
            fullName: u.fullName,
            avgScore: avgScore,
            testCount: u.history.length
          };
        });

      // Sắp xếp giảm dần theo điểm trung bình, sau đó theo số bài thi đã làm
      rankedUsers.sort((a, b) => b.avgScore - a.avgScore || b.testCount - a.testCount);

      // Chỉ lấy Top 5
      const top5 = rankedUsers.slice(0, 5);

      leaderboardList.innerHTML = '';
      if (top5.length === 0) {
        leaderboardList.innerHTML = `<div class="text-center py-4 text-muted small">Chưa có cao thủ nào ghi danh trên bảng vàng!</div>`;
        return;
      }

      top5.forEach((u, idx) => {
        const rank = idx + 1;
        const badgeClass = rank === 1 ? 'rank-1' : (rank === 2 ? 'rank-2' : (rank === 3 ? 'rank-3' : 'rank-other'));
        const badgeIcon = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : rank));

        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
          <div class="leaderboard-rank ${badgeClass}">${badgeIcon}</div>
          <div class="leaderboard-info">
            <div class="leaderboard-name text-truncate" style="max-width: 140px;">${escapeHTML(u.fullName)}</div>
            <div class="small text-muted">${u.testCount} bài thi</div>
          </div>
          <div class="leaderboard-score fw-bold">${u.avgScore.toFixed(1)} / 10</div>
        `;
        leaderboardList.appendChild(item);
      });
    } catch (err) {
      console.error('Lỗi tải bảng xếp hạng cao thủ:', err);
      leaderboardList.innerHTML = `<div class="text-center py-4 text-danger small">Lỗi tải dữ liệu bảng xếp hạng!</div>`;
    }
  }

  // Hàm ẩn Sidebar Offcanvas
  function closeSidebar() {
    const sidebarEl = document.getElementById('sidebarMenu');
    if (sidebarEl) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarEl) || new bootstrap.Offcanvas(sidebarEl);
      bsOffcanvas.hide();
    }
  }

  // Đăng ký sự kiện cho Sidebar Offcanvas mới (QuizMaster Theme)
  const sidebarTourBtn = document.getElementById('sidebarTourBtn');
  if (sidebarTourBtn) {
    sidebarTourBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Đặt trạng thái active
      document.querySelectorAll('.sidebar-link').forEach(item => item.classList.remove('active'));
      sidebarTourBtn.classList.add('active');
      
      closeSidebar();
      goBackToHome();
    });
  }

  const sidebarDestBtn = document.getElementById('sidebarDestBtn');
  if (sidebarDestBtn) {
    sidebarDestBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Đặt trạng thái active
      document.querySelectorAll('.sidebar-link').forEach(item => item.classList.remove('active'));
      sidebarDestBtn.classList.add('active');
      
      closeSidebar();
      showTab('leaderboard');
    });
  }

  const sidebarHomeBtn = document.getElementById('sidebarHomeBtn');
  if (sidebarHomeBtn) {
    sidebarHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeSidebar();
      
      const currentUser = window.QuizSession.get();
      if (!currentUser) {
        alert('Vui lòng đăng nhập để xem lịch sử làm bài và biểu đồ điểm số của bạn!');
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
      } else {
        showTab('profile');
      }
    });
  }

  // Đăng ký sự kiện cho các Mock Link thông tin bổ sung trong Sidebar
  const mockLinks = [
    { id: 'sidebarAboutBtn', name: 'Giới thiệu Khoa & Nhóm 3 (Về Chúng Tôi)' },
    { id: 'sidebarBlogBtn', name: 'Tin tức Giáo dục & Tài liệu ôn thi (Blog)' },
    { id: 'sidebarContactBtn', name: 'Hỗ trợ Kỹ thuật & Liên hệ (Liên Hệ)' }
  ];

  mockLinks.forEach(link => {
    const el = document.getElementById(link.id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        
        document.querySelectorAll('.sidebar-link').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
        
        closeSidebar();
        
        // Thông báo mock cao cấp
        alert(`🌟 Chào mừng bạn đến với mục: ${link.name}!\n\nHệ thống ôn thi trực tuyến QuizMaster đang tiến hành đồng bộ tài nguyên từ máy chủ FIT-DNU.\n\nCảm ơn bạn đã đồng hành cùng Nhóm 3 - FIT - DNU!`);
      });
    }
  });

  // Đăng ký sự kiện cho Chân trang (Footer)
  const footerHomeBtn = document.getElementById('footerHomeBtn');
  if (footerHomeBtn) {
    footerHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goBackToHome();
    });
  }

  const footerLeaderboardBtn = document.getElementById('footerLeaderboardBtn');
  if (footerLeaderboardBtn) {
    footerLeaderboardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showTab('leaderboard');
    });
  }

  const footerProfileBtn = document.getElementById('footerProfileBtn');
  if (footerProfileBtn) {
    footerProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentUser = window.QuizSession.get();
      if (!currentUser) {
        alert('Vui lòng đăng nhập để xem thông tin trang cá nhân và lịch sử luyện thi!');
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
      } else {
        showTab('profile');
      }
    });
  }

  // ==================== 6. TAB THỐNG KÊ & TRANG CÁ NHÂN (USER ACCOUNT DASHBOARD) ====================

  const navLeaderboardBtn = document.getElementById('navLeaderboardBtn');
  const brandLogo = document.getElementById('brandLogo');
  
  const backToHomeFromLeaderboardBtn = document.getElementById('backToHomeFromLeaderboardBtn');
  const backToHomeFromProfileBtn = document.getElementById('backToHomeFromProfileBtn');
  
  const leaderboardView = document.getElementById('leaderboardView');
  const profileView = document.getElementById('profileView');
  const historyTableBody = document.getElementById('historyTableBody');

  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      goBackToHome();
    });
  }

  if (navLeaderboardBtn) {
    navLeaderboardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showTab('leaderboard');
    });
  }

  if (backToHomeFromLeaderboardBtn) {
    backToHomeFromLeaderboardBtn.addEventListener('click', () => {
      goBackToHome();
    });
  }

  if (backToHomeFromProfileBtn) {
    backToHomeFromProfileBtn.addEventListener('click', () => {
      goBackToHome();
    });
  }

  function showTab(tabName) {
    // Tắt đồng hồ nếu đang thi mà ấn nhảy trang
    if (examTimer) clearInterval(examTimer);

    // Gỡ active của navbar
    if (navLeaderboardBtn) navLeaderboardBtn.classList.remove('active');

    // Ẩn tất cả các view chính
    homeView.classList.add('d-none');
    leaderboardView.classList.add('d-none');
    profileView.classList.add('d-none');
    quizView.classList.add('d-none');

    if (tabName === 'home') {
      homeView.classList.remove('d-none');
      loadTopics();
    } else if (tabName === 'leaderboard') {
      if (navLeaderboardBtn) navLeaderboardBtn.classList.add('active');
      leaderboardView.classList.remove('d-none');
      loadLeaderboard();
    } else if (tabName === 'profile') {
      profileView.classList.remove('d-none');
      renderUserProfile();
    }
    window.scrollTo(0, 0);
  }

  async function renderUserProfile() {
    const currentUser = window.QuizSession.get();
    if (!currentUser) return;

    // Lấy các phần tử DOM trên Card thông tin tài khoản
    const avatarCharEl = document.getElementById('profileAvatarChar');
    const fullNameEl = document.getElementById('profileFullName');
    const roleBadgeEl = document.getElementById('profileRoleBadge');
    const usernameEl = document.getElementById('profileUsername');
    
    const testCountEl = document.getElementById('profileTestCount');
    const avgScoreEl = document.getElementById('profileAvgScore');
    const rankDisplayEl = document.getElementById('profileRankDisplay');

    // Điền thông tin cơ bản
    if (avatarCharEl && currentUser.fullName) {
      avatarCharEl.textContent = currentUser.fullName.trim().charAt(0).toUpperCase();
    }
    if (fullNameEl) fullNameEl.textContent = currentUser.fullName;
    if (usernameEl) usernameEl.textContent = currentUser.username;
    if (roleBadgeEl) {
      roleBadgeEl.textContent = currentUser.role === 'admin' ? 'Quản trị viên' : 'Học sinh';
      roleBadgeEl.className = currentUser.role === 'admin' 
        ? 'badge bg-warning text-dark py-1 px-2.5 fw-bold' 
        : 'badge bg-primary py-1 px-2.5 fw-bold';
    }

    const history = currentUser.history || [];
    if (testCountEl) testCountEl.textContent = history.length;

    let avgScoreVal = 0.0;
    if (history.length > 0) {
      const totalScore = history.reduce((sum, h) => sum + h.score, 0);
      avgScoreVal = totalScore / history.length;
    }
    if (avgScoreEl) avgScoreEl.textContent = avgScoreVal.toFixed(1);

    // Tính toán thứ bậc xếp hạng thực tế trên toàn hệ thống
    if (rankDisplayEl) {
      rankDisplayEl.textContent = 'Chưa xếp hạng';
      try {
        const allUsers = await window.QuizAPI.getUsers();
        
        // Chỉ xếp hạng các user có thi ít nhất 1 bài
        const ranked = allUsers
          .filter(u => Array.isArray(u.history) && u.history.length > 0)
          .map(u => {
            const total = u.history.reduce((sum, h) => sum + h.score, 0);
            return {
              id: u.id,
              avg: total / u.history.length
            };
          });

        // Sắp xếp giảm dần theo trung bình điểm tích lũy
        ranked.sort((a, b) => b.avg - a.avg);

        const myRankIdx = ranked.findIndex(r => r.id === currentUser.id);
        if (myRankIdx !== -1) {
          rankDisplayEl.textContent = `#${myRankIdx + 1} trên hệ thống`;
        }
      } catch (err) {
        console.error('Lỗi tính toán thứ hạng tài khoản:', err);
      }
    }

    // Đổ danh sách lịch sử thi chi tiết
    renderUserHistory();
  }

  function renderUserHistory() {
    const currentUser = window.QuizSession.get();
    if (!currentUser) {
      historyTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">Vui lòng đăng nhập để xem lịch sử ôn luyện!</td></tr>`;
      return;
    }

    const history = currentUser.history || [];
    historyTableBody.innerHTML = '';

    if (history.length === 0) {
      historyTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">Bạn chưa thực hiện bài luyện thi nào!</td></tr>`;
      if (window.myHistoryChart) {
        window.myHistoryChart.destroy();
        window.myHistoryChart = null;
      }
      return;
    }

    // Sắp xếp lịch sử thi từ mới nhất đến cũ nhất
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    sortedHistory.forEach(h => {
      const date = new Date(h.timestamp).toLocaleString('vi-VN');
      const minutes = Math.floor(h.timeSpent / 60);
      const seconds = h.timeSpent % 60;
      const timeStr = `${minutes}m ${seconds}s`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${date}</td>
        <td class="fw-semibold text-primary">${escapeHTML(h.topicName)}</td>
        <td class="text-center">${h.score >= 5.0 ? '🟢 <span class="text-success fw-bold">Đạt</span>' : '🔴 <span class="text-danger fw-bold">Chưa đạt</span>'}</td>
        <td class="text-center text-secondary font-monospace">${timeStr}</td>
        <td class="text-center"><span class="badge bg-primary-subtle text-primary px-3 py-2 fw-bold fs-6">${h.score.toFixed(1)}</span></td>
      `;
      historyTableBody.appendChild(tr);
    });

    // Vẽ biểu đồ tiến trình điểm thi
    drawHistoryChart(history);
  }

  function drawHistoryChart(history) {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    // Sắp xếp theo trình tự thời gian tăng dần để vẽ biểu đồ
    const chronoHistory = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = chronoHistory.map((h, idx) => `Lần ${idx + 1}`);
    const dataPoints = chronoHistory.map(h => h.score);
    const topicNames = chronoHistory.map(h => h.topicName);

    if (window.myHistoryChart) {
      window.myHistoryChart.destroy();
    }

    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';

    window.myHistoryChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: dataPoints,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.06)',
          borderWidth: 3.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              title: (context) => {
                const idx = context[0].dataIndex;
                return `Lần luyện thi thứ ${idx + 1}`;
              },
              label: (context) => {
                const idx = context.dataIndex;
                return `Điểm: ${context.parsed.y.toFixed(1)} (${topicNames[idx]})`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              font: {
                family: 'Outfit',
                weight: '500'
              }
            }
          },
          y: {
            min: 0,
            max: 10,
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              stepSize: 2,
              font: {
                family: 'Outfit',
                weight: '500'
              }
            }
          }
        }
      }
    });
  }

  // ==================== 7. CHỨNG CHỈ ĐIỆN TỬ VÀ IN ĐỂ TẢI XUỐNG ====================

  const getCertBtn = document.getElementById('getCertificateBtn');
  const certificateOverlay = document.getElementById('certificateOverlay');
  const closeCertBtn = document.getElementById('closeCertBtn');
  const printCertBtn = document.getElementById('printCertBtn');
  const certStudentName = document.getElementById('certStudentName');
  const certTopicName = document.getElementById('certTopicName');
  const certScore = document.getElementById('certScore');
  const certDate = document.getElementById('certDate');

  if (getCertBtn) {
    getCertBtn.addEventListener('click', () => {
      const currentUser = window.QuizSession.get();
      if (!currentUser || !currentTopic) return;

      // Điền thông tin vào mẫu chứng chỉ danh giá
      if (certStudentName) certStudentName.textContent = currentUser.fullName;
      if (certTopicName) certTopicName.textContent = currentTopic.name;
      
      const scoreVal = parseFloat(document.getElementById('reportScore').textContent) || 0.0;
      if (certScore) certScore.textContent = `${scoreVal.toFixed(1)} / 10.0`;
      
      if (certDate) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        certDate.textContent = `${dd}/${mm}/${yyyy}`;
      }

      if (certificateOverlay) {
        certificateOverlay.classList.remove('d-none');
      }
    });
  }

  if (closeCertBtn) {
    closeCertBtn.addEventListener('click', () => {
      if (certificateOverlay) {
        certificateOverlay.classList.add('d-none');
      }
      goBackToHome();
    });
  }

  if (printCertBtn) {
    printCertBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // ==================== TIỆN ÍCH HỖ TRỢ ====================
  
  // Hàm bảo vệ chống tấn công XSS khi hiển thị text người dùng nhập
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==================== KHỞI CHẠY ỨNG DỤNG ====================
  renderAuthContext();
  loadTopics();
});
