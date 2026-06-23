import {
  FiFileText,
  FiMail,
  FiUserCheck,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiMessageCircle,
  FiArrowRight
} from 'react-icons/fi';

import Card from '../components/Card';
import Alert from '../components/Alert';

function LeaveGuidePage() {
  const noticeRules = [
    {
      range: 'Đến 1 ngày',
      notice: '03 ngày'
    },
    {
      range: 'Từ 2 – 5 ngày',
      notice: '07 ngày'
    },
    {
      range: 'Từ 6 – 10 ngày',
      notice: '15 ngày'
    },
    {
      range: 'Từ 11 – 20 ngày',
      notice: '21 ngày'
    },
    {
      range: 'Từ 21 ngày trở lên',
      notice: '30 ngày'
    }
  ];

  return (
    <section className="leave-guide-page stack">
      <Card title="Quy trình duyệt đơn nghỉ phép">
        <Alert type="info">
          Sau khi gửi đơn thành công, nhân sự vui lòng lưu lại <strong>mã đơn phép</strong> để tra cứu trạng thái khi cần.
        </Alert>

        <div className="guide-flow">
          <div className="guide-flow-step">
            <div className="guide-flow-icon">
              <FiFileText />
            </div>

            <div className="guide-flow-content">
              <span className="guide-flow-badge">Bước 1</span>
              <h3>Nộp đơn online</h3>

              <p>
                Nhân sự điền đầy đủ thông tin nghỉ phép, thông tin bàn giao công việc và gửi đơn trên hệ thống.
              </p>

              <ul>
                <li>Gửi đơn thành công trên hệ thống</li>
                <li>Nhận email xác nhận kèm mã đơn phép</li>
              </ul>
            </div>
          </div>

          <div className="guide-flow-arrow">
            <FiArrowRight />
          </div>

          <div className="guide-flow-step">
            <div className="guide-flow-icon">
              <FiUserCheck />
            </div>

            <div className="guide-flow-content">
              <span className="guide-flow-badge">Bước 2</span>
              <h3>Line Manager xử lý</h3>

              <p>
                Line Manager nhận email thông báo và thực hiện duyệt hoặc từ chối đơn.
              </p>

              <ul>
                <li>Nếu duyệt, đơn chuyển tiếp đến HR Manager</li>
                <li>Nếu từ chối, quy trình dừng tại đây và hệ thống gửi kết quả cho nhân sự</li>
              </ul>
            </div>
          </div>

          <div className="guide-flow-arrow">
            <FiArrowRight />
          </div>

          <div className="guide-flow-step">
            <div className="guide-flow-icon">
              <FiCheckCircle />
            </div>

            <div className="guide-flow-content">
              <span className="guide-flow-badge">Bước 3</span>
              <h3>HR Manager xử lý</h3>

              <p>
                Nếu Line Manager đã duyệt, đơn sẽ được chuyển tiếp đến HR Manager để duyệt cấp cuối.
              </p>

              <ul>
                <li>HR Manager duyệt hoặc từ chối</li>
                <li>Hệ thống cập nhật trạng thái cuối cùng</li>
                <li>Nhân sự nhận email thông báo kết quả</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="guide-highlight-box">
          <div className="guide-highlight-icon">
            <FiAlertTriangle />
          </div>

          <div>
            <strong>Lưu ý quan trọng</strong>
            <p>
              Nếu <strong>Line Manager từ chối</strong>, đơn sẽ <strong>không chuyển tiếp đến HR Manager</strong>.
              Hệ thống sẽ gửi thông báo kết quả trực tiếp về email của nhân sự.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Lưu ý về thời gian báo trước">
        <Alert type="warning">
          Nhân sự cần gửi đơn nghỉ phép đúng thời gian báo trước theo quy định để đảm bảo việc sắp xếp công việc và bàn giao được thực hiện kịp thời.
        </Alert>

        <div className="notice-rule-list">
          <div className="notice-rule-head">
            <span>Số ngày nghỉ</span>
            <span>Thời gian báo trước</span>
          </div>

          {noticeRules.map((item) => (
            <div className="notice-rule-row" key={item.range}>
              <div className="notice-rule-range">
                <FiClock />
                <strong>{item.range}</strong>
              </div>

              <div className="notice-rule-days">
                Báo trước <strong>{item.notice}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="guide-contact-box">
          <div className="guide-contact-icon">
            <FiMessageCircle />
          </div>

          <div className="guide-contact-content">
            <strong>Cần hỗ trợ thêm?</strong>
            <p>
              Nếu có thắc mắc, vui lòng liên hệ về{' '}
              <a
                href="https://www.facebook.com/profile.php?id=61552138648751"
                target="_blank"
                rel="noreferrer"
              >
                FB GA Hành Chính
              </a>.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}

export default LeaveGuidePage;