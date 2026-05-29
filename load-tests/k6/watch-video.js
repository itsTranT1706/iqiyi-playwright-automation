// TODO: Load Testing - Mô phỏng 1000 người xem phim đồng thời
// Dùng K6 để gửi HTTP request đến endpoint video streaming
// Đo thời gian phản hồi (response time) và tỷ lệ lỗi (error rate)

import http from 'k6/http';
import { sleep } from 'k6';

// TODO: Cấu hình số lượng virtual users và thời gian chạy
export const options = {
  // vus: 1000,
  // duration: '30s',
};

export default function () {
  // TODO: Implement load test logic
}
