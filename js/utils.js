// Project: QuizMaster - Developed by NHÓM 3-FIT-DNU

(function () {
  // Key lưu trữ cài đặt và dữ liệu đăng nhập
  const THEME_KEY = 'quizmaster-theme';
  const SESSION_KEY = 'quizmaster-user-session';

  /**
   * Quản lý trạng thái hiển thị của Loading Spinner toàn màn hình
   */
  window.showSpinner = function () {
    const spinner = document.getElementById('globalSpinner');
    if (spinner) {
      spinner.classList.add('show');
    }
  };

  window.hideSpinner = function () {
    const spinner = document.getElementById('globalSpinner');
    if (spinner) {
      // Một khoảng trễ cực nhỏ để hiệu ứng mờ mịn màng và không bị nháy
      setTimeout(() => {
        spinner.classList.remove('show');
      }, 200);
    }
  };

  /**
   * Quản lý phiên đăng nhập của người dùng qua sessionStorage
   */
  window.QuizSession = {
    /**
     * Lưu thông tin người dùng đăng nhập thành công vào phiên làm việc
     * @param {object} userData - Đối tượng user { id, username, fullName, role }
     */
    save(userData) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    },

    /**
     * Lấy thông tin người dùng hiện tại từ phiên làm việc
     * @returns {object|null} Trả về đối tượng user hoặc null nếu chưa đăng nhập
     */
    get() {
      const data = sessionStorage.getItem(SESSION_KEY);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Lỗi phân tích cú pháp phiên người dùng:', e);
        this.clear();
        return null;
      }
    },

    /**
     * Xóa thông tin phiên người dùng khi đăng xuất
     */
    clear() {
      sessionStorage.removeItem(SESSION_KEY);
    },

    /**
     * Kiểm tra xem người dùng hiện tại có phải là Quản trị viên hay không
     * @returns {boolean}
     */
    isAdmin() {
      const user = this.get();
      return user && user.role === 'admin';
    }
  };

  /**
   * Thuật toán xáo trộn mảng ngẫu nhiên (Fisher-Yates Shuffle)
   * Giúp xáo trộn thứ tự các câu hỏi hoặc đáp án một cách khách quan.
   * @param {Array} array - Mảng cần xáo trộn
   * @returns {Array} Một bản sao mảng đã được xáo trộn
   */
  window.shuffleArray = function (array) {
    if (!Array.isArray(array)) return [];
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  /**
   * Quản lý chế độ sáng/tối (Dark Mode) dựa trên Bootstrap 5 và HTML attribute data-bs-theme
   */
  window.QuizTheme = {
    /**
     * Khởi tạo giao diện khi tải trang dựa trên lựa chọn cũ hoặc hệ điều hành
     */
    init() {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        this.set(savedTheme);
      } else {
        // Tự động chọn theo tùy chọn hệ thống nếu chưa có lưu trữ
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.set(systemPrefersDark ? 'dark' : 'light');
      }
    },

    /**
     * Thiết lập chủ đề sáng hoặc tối cho giao diện trang
     * @param {'light'|'dark'} theme 
     */
    set(theme) {
      document.documentElement.setAttribute('data-bs-theme', theme);
      localStorage.setItem(THEME_KEY, theme);
      this.updateToggleButton(theme);
    },

    /**
     * Chuyển đổi qua lại giữa Light Mode và Dark Mode
     */
    toggle() {
      const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.set(newTheme);
    },

    /**
     * Cập nhật biểu tượng hoặc text trên nút bấm chuyển đổi ngoài giao diện (nếu có)
     * @param {'light'|'dark'} theme 
     */
    updateToggleButton(theme) {
      const toggleBtn = document.getElementById('themeToggleBtn');
      if (toggleBtn) {
        if (theme === 'dark') {
          toggleBtn.innerHTML = '☀️ <span class="d-none d-md-inline ms-1">Giao diện Sáng</span>';
          toggleBtn.className = 'btn btn-outline-warning btn-sm';
        } else {
          toggleBtn.innerHTML = '🌙 <span class="d-none d-md-inline ms-1">Giao diện Tối</span>';
          toggleBtn.className = 'btn btn-outline-dark btn-sm';
        }
      }
    }
  };

  const SOUND_KEY = 'quizmaster-sound';

  window.QuizAudio = {
    enabled: true,
    audioCtx: null,

    init() {
      const savedSound = localStorage.getItem(SOUND_KEY);
      this.enabled = savedSound !== 'off'; // Mặc định là bật tiếng
      this.updateToggleButton();

      const toggleBtn = document.getElementById('soundToggleBtn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggle());
      }
    },

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem(SOUND_KEY, this.enabled ? 'on' : 'off');
      this.updateToggleButton();
      if (this.enabled) {
        this.playSuccess();
      }
    },

    updateToggleButton() {
      const toggleBtn = document.getElementById('soundToggleBtn');
      if (toggleBtn) {
        if (this.enabled) {
          toggleBtn.innerHTML = '🔊 <span class="d-none d-md-inline ms-1">Bật Âm Thanh</span>';
          toggleBtn.className = 'btn btn-outline-info btn-sm';
        } else {
          toggleBtn.innerHTML = '🔇 <span class="d-none d-md-inline ms-1">Tắt Âm Thanh</span>';
          toggleBtn.className = 'btn btn-outline-secondary btn-sm';
        }
      }
    },

    getAudioContext() {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    },

    playClick() {
      if (!this.enabled) return;
      try {
        const ctx = this.getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {
        console.error('Audio synthesis failed:', e);
      }
    },

    playSuccess() {
      if (!this.enabled) return;
      try {
        const ctx = this.getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.08); // G5
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch (e) {
        console.error('Audio synthesis failed:', e);
      }
    },

    playError() {
      if (!this.enabled) return;
      try {
        const ctx = this.getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, ctx.currentTime); // C3 low buzz
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) {
        console.error('Audio synthesis failed:', e);
      }
    },

    playTick() {
      if (!this.enabled) return;
      try {
        const ctx = this.getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) {
        console.error('Audio synthesis failed:', e);
      }
    },

    playVictory() {
      if (!this.enabled) return;
      try {
        const ctx = this.getAudioContext();
        const notes = [
          { f: 261.63, d: 0.15 }, // C4
          { f: 329.63, d: 0.15 }, // E4
          { f: 392.00, d: 0.15 }, // G4
          { f: 523.25, d: 0.40 }  // C5
        ];

        let timeOffset = 0;
        notes.forEach(note => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.f, ctx.currentTime + timeOffset);
          gain.gain.setValueAtTime(0, ctx.currentTime + timeOffset);
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + timeOffset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + note.d);

          osc.start(ctx.currentTime + timeOffset);
          osc.stop(ctx.currentTime + timeOffset + note.d);

          timeOffset += note.d * 0.8;
        });
      } catch (e) {
        console.error('Audio synthesis failed:', e);
      }
    }
  };

  // Tự động kích hoạt thiết lập Theme & Audio ngay khi file script được tải xong
  document.addEventListener('DOMContentLoaded', () => {
    window.QuizTheme.init();
    window.QuizAudio.init();
  });
})();
