import { useState } from 'react';

import LeaveRequestForm from './pages/LeaveRequestForm';
import LookupPage from './pages/LookupPage';
import HRDashboard from './pages/HRDashboard';
import DecisionPage from './pages/DecisionPage';
import LeaveGuidePage from './pages/LeaveGuidePage';

function App() {
  const params = new URLSearchParams(window.location.search);
  const pageFromUrl = params.get('page');
  const pathname = window.location.pathname;

  const isDecisionPage = pageFromUrl === 'decision';
  const isHRPage = pathname === '/hr' || pathname === '/hr/';

  const [page, setPage] = useState('submit');

  if (isDecisionPage) {
    return (
      <main className="app-shell">
        <Hero type="decision" />
        <DecisionPage />
      </main>
    );
  }

  if (isHRPage) {
    return (
      <main className="app-shell">
        <HRDashboard />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Hero type="public" />

      <nav className="tabs">
        <button
          type="button"
          className={page === 'submit' ? 'tab active' : 'tab'}
          onClick={() => setPage('submit')}
        >
          Gửi đơn
        </button>

        <button
          type="button"
          className={page === 'lookup' ? 'tab active' : 'tab'}
          onClick={() => setPage('lookup')}
        >
          Tra cứu trạng thái
        </button>

        <button
          type="button"
          className={page === 'guide' ? 'tab active' : 'tab'}
          onClick={() => setPage('guide')}
        >
          Quy trình & lưu ý
        </button>
      </nav>

      {page === 'submit' && <LeaveRequestForm />}
      {page === 'lookup' && <LookupPage />}
      {page === 'guide' && <LeaveGuidePage />}
    </main>
  );
}

function Hero({ type }) {
  const content = {
    public: {
      eyebrow: 'Phát triển bởi HR Team',
      title: 'NỘP ĐƠN NGHỈ PHÉP ONLINE',
      desc: 'Gửi đơn và tra cứu trạng thái nghỉ phép nhanh chóng, rõ ràng.'
    },
    hr: {
      eyebrow: 'HR Workspace',
      title: 'HR Dashboard',
      desc: 'Quản lý, theo dõi và xuất dữ liệu đơn nghỉ phép tập trung.'
    },
    decision: {
      eyebrow: 'Approval Center',
      title: 'Xử lý đơn nghỉ phép',
      desc: 'Ghi nhận thao tác duyệt hoặc từ chối đơn nghỉ phép.'
    }
  };

  const item = content[type] || content.public;

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">{item.eyebrow}</p>
        <h1>{item.title}</h1>
        <p className="hero-desc">{item.desc}</p>
      </div>

      <div className="hero-logo">
        <img src="/company-logo.png" alt="Company logo" />
      </div>
    </section>
  );
}

export default App;