import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// Import các component từ các file bạn đã tạo
import { LoginPage } from './pages/auth/Login'
import { CandidateRegisterPage } from './pages/auth/RegisterCandidate'
import { RecruiterRegisterPage } from './pages/auth/RegisterEmployer'

// --- Component Trang Chủ (Chứa giao diện cũ của bạn) ---
function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>HireArch Project</h1>
          <p>
            Hệ thống cổng thông tin nhân sự doanh nghiệp.
          </p>
        </div>

        {/* Các nút điều hướng nhanh */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
          <Link to="/login" className="counter" style={{ textDecoration: 'none' }}>
            Đăng nhập
          </Link>
          <Link to="/register-candidate" className="counter" style={{ textDecoration: 'none', background: '#4a5568' }}>
            Ứng viên
          </Link>
          <Link to="/register-employer" className="counter" style={{ textDecoration: 'none', background: '#10264f' }}>
            Nhà tuyển dụng
          </Link>
        </div>

        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Số lần bấm: {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Tài liệu</h2>
          <p>Tìm hiểu về hệ thống</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Vite Docs
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                React Docs
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Liên kết</h2>
          <p>Cộng đồng HireArch</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">GitHub</a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">Discord</a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

// --- Component App Chính (Quản lý điều hướng) ---
function App() {
  return (
    <Router>
      <Routes>
        {/* Đường dẫn trang chủ */}
        <Route path="/" element={<HomePage />} />

        {/* Đường dẫn các trang Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-candidate" element={<CandidateRegisterPage />} />
        <Route path="/register-employer" element={<RecruiterRegisterPage />} />
      </Routes>
    </Router>
  )
}

export default App