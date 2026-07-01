import {
  FiFileText,
  FiUserCheck,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiMessageCircle,
  FiUsers
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

  const guideSteps = [
    {
      icon: <FiFileText />,
      step: 'Bước 1',
      title: 'Nộp đơn online',
      description:
        'Nhân sự điền thông tin nghỉ phép, nội dung bàn giao, chọn Leader và Manager phù hợp trên hệ thống.',
      note: 'Sau khi gửi thành công, hệ thống sẽ gửi email xác nhận kèm mã đơn phép.'
    },
    {
      icon: <FiUsers />,
      step: 'Bước 2',
      title: 'Leader xử lý',
      description:
        'Leader của bộ phận nhận email thông báo và thực hiện duyệt hoặc từ chối đơn.',
      note: 'Nếu Leader duyệt, đơn sẽ chuyển tiếp đến Line Manager/Manager.'
    },
    {
      icon: <FiUserCheck />,
      step: 'Bước 3',
      title: 'Manager xử lý',
      description:
        'Sau khi Leader duyệt, đơn được chuyển đến Line Manager/Manager để xử lý cấp tiếp theo.',
      note: 'Nếu Manager duyệt, đơn sẽ chuyển tiếp đến HR Manager.'
    },
    {
      icon: <FiCheckCircle />,
      step: 'Bước 4',
      title: 'HR Manager xử lý',
      description:
        'HR Manager là cấp duyệt cuối cùng và cập nhật trạng thái hoàn tất của đơn nghỉ phép.',
      note: 'Nhân sự sẽ nhận email thông báo kết quả cuối cùng.'
    }
  ];

  return (
    <section className="leave-guide-page stack">
      <Card title="Quy trình duyệt đơn nghỉ phép">
        <Alert type="info">
          Sau khi gửi đơn thành công, nhân sự vui lòng lưu lại{' '}
          <strong>mã đơn phép</strong> để tra cứu trạng thái khi cần.
        </Alert>

        <div className="guide-flow-clean">
          {guideSteps.map((item) => (
            <div className="guide-clean-step" key={item.step}>
              <div className="guide-clean-top">
                <div className="guide-clean-icon">
                  {item.icon}
                </div>

                <span className="guide-flow-badge">{item.step}</span>
              </div>

              <div className="guide-clean-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="guide-clean-note">
                  {item.note}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="guide-warning-panel">
          <div className="guide-warning-header">
            <div className="guide-warning-icon">
              <FiAlertTriangle />
            </div>

            <div>
              <span>Lưu ý quan trọng</span>
              <h3>Những điểm cần nắm trước khi gửi đơn</h3>
            </div>
          </div>

          <div className="guide-warning-grid-3">
            <div className="guide-warning-card guide-warning-card-danger">
              <span className="guide-warning-label">Trường hợp từ chối</span>

              <p>
                Nếu <strong>Leader hoặc Line Manager/Manager từ chối</strong>, đơn sẽ{' '}
                <strong>không chuyển tiếp đến cấp duyệt tiếp theo</strong>. Hệ thống sẽ
                gửi thông báo kết quả trực tiếp về email của nhân sự.
              </p>
            </div>

            <div className="guide-warning-card guide-warning-card-ec">
              <span className="guide-warning-label">Áp dụng cho mọi bộ phận</span>

              <p>
                Tất cả đơn nghỉ phép đều cần được xử lý theo thứ tự:{' '}
                <strong>Leader duyệt trước</strong>, sau đó chuyển đến{' '}
                <strong>Line Manager/Manager</strong> và cuối cùng là{' '}
                <strong>HR Manager</strong>.
              </p>

              <div className="guide-mini-flow">
                <div className="guide-mini-step">
                  <div className="guide-mini-step-number">01</div>
                  <span>Nhân sự nộp đơn</span>
                </div>

                <div className="guide-mini-step">
                  <div className="guide-mini-step-number">02</div>
                  <span>Leader duyệt</span>
                </div>

                <div className="guide-mini-step">
                  <div className="guide-mini-step-number">03</div>
                  <span>Manager duyệt</span>
                </div>

                <div className="guide-mini-step">
                  <div className="guide-mini-step-number">04</div>
                  <span>HR Manager duyệt</span>
                </div>
              </div>
            </div>

            <div className="guide-warning-card guide-warning-card-danger">
              <span className="guide-warning-label">Nghỉ ốm hưởng chế độ BHXH</span>

              <p>
                Trường hợp Người lao động nghỉ ốm đau có hưởng chế độ BHXH, có thể
                đính kèm hình ảnh hoặc file PDF{' '}
                <strong>
                  “GIẤY CHỨNG NHẬN NGHỈ VIỆC HƯỞNG BẢO HIỂM XÃ HỘI”
                </strong>{' '}
                của bệnh viện khi gửi đơn để HR kiểm tra khi cần.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Lưu ý về thời gian báo trước">
        <div className="notice-top-text">
          Nhân sự cần gửi đơn nghỉ phép đúng thời gian báo trước theo quy định để đảm bảo
          việc sắp xếp công việc và bàn giao được thực hiện kịp thời.
        </div>

        <div className="notice-table-card">
          <div className="notice-table-head">
            <span>Số ngày nghỉ</span>
            <span>Thời gian báo trước</span>
          </div>

          {noticeRules.map((item) => (
            <div className="notice-table-row" key={item.range}>
              <div className="notice-table-left">
                <FiClock />
                <strong>{item.range}</strong>
              </div>

              <div className="notice-table-right">
                <span className="notice-pill">Báo trước {item.notice}</span>
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