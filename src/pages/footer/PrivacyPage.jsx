import React from 'react';
import '../../style/pages/footer/PrivacyPage.css';

function PrivacyPage() {
    return (<div className="privacy-container">
        <div className="privacy-header">
            <h1>Chính Sách Bảo Mật</h1>
            <p>Cập nhật lần cuối: 01/07/2025</p>
        </div>

        <div className="privacy-content">
            <div className="privacy-toc">
                <h2>Mục lục</h2>
                <ul>
                    <li><a href="#introduction">1. Giới thiệu</a></li>
                    <li><a href="#information-collection">2. Thông tin chúng tôi thu thập</a></li>
                    <li><a href="#information-use">3. Cách chúng tôi sử dụng thông tin</a></li>
                    <li><a href="#information-sharing">4. Chia sẻ thông tin</a></li>
                    <li><a href="#data-security">5. Bảo mật dữ liệu</a></li>
                    <li><a href="#user-rights">6. Quyền của người dùng</a></li>
                    <li><a href="#cookies">7. Cookie và công nghệ theo dõi</a></li>
                    <li><a href="#children-privacy">8. Quyền riêng tư của trẻ em</a></li>
                    <li><a href="#changes">9. Thay đổi chính sách bảo mật</a></li>
                    <li><a href="#contact">10. Liên hệ với chúng tôi</a></li>
                </ul>
            </div>

            <section id="introduction">
                <h2>1. Giới thiệu</h2>
                <p>
                    BrainGame ("chúng tôi", "của chúng tôi") cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo
                    mật này mô tả cách chúng tôi thu thập, sử dụng và chia sẻ thông tin cá nhân của bạn khi bạn sử
                    dụng trang web và dịch vụ của chúng tôi.
                </p>
                <p>
                    Bằng cách sử dụng trang web và dịch vụ của chúng tôi, bạn đồng ý với việc thu thập và sử dụng
                    thông tin theo chính sách này. Nếu bạn không đồng ý với chính sách của chúng tôi, vui lòng không
                    sử dụng dịch vụ của chúng tôi.
                </p>
            </section>

            <section id="information-collection">
                <h2>2. Thông tin chúng tôi thu thập</h2>
                <p>
                    Chúng tôi thu thập một số loại thông tin từ người dùng của mình, bao gồm:
                </p>
                <h3>Thông tin cá nhân</h3>
                <p>
                    Khi bạn đăng ký tài khoản, chúng tôi có thể thu thập thông tin cá nhân như:
                </p>
                <ul>
                    <li>Họ và tên</li>
                    <li>Địa chỉ email</li>
                    <li>Số điện thoại (tùy chọn)</li>
                    <li>Ngày sinh</li>
                    <li>Thông tin thanh toán (khi bạn mua gói dịch vụ trả phí)</li>
                </ul>

                <h3>Thông tin sử dụng</h3>
                <p>
                    Chúng tôi cũng thu thập thông tin về cách bạn sử dụng dịch vụ của chúng tôi, bao gồm:
                </p>
                <ul>
                    <li>Dữ liệu đăng nhập và hoạt động</li>
                    <li>Thông tin thiết bị và trình duyệt</li>
                    <li>Địa chỉ IP và dữ liệu vị trí</li>
                    <li>Tiến trình và điểm số trong các trò chơi</li>
                    <li>Thời gian và tần suất sử dụng</li>
                </ul>
            </section>

            <section id="information-use">
                <h2>3. Cách chúng tôi sử dụng thông tin</h2>
                <p>
                    Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:
                </p>
                <ul>
                    <li>Cung cấp, duy trì và cải thiện dịch vụ của chúng tôi</li>
                    <li>Xử lý giao dịch và thanh toán</li>
                    <li>Gửi thông báo liên quan đến tài khoản và dịch vụ</li>
                    <li>Cung cấp hỗ trợ khách hàng</li>
                    <li>Phân tích cách người dùng sử dụng dịch vụ để cải thiện trải nghiệm</li>
                    <li>Phát hiện, ngăn chặn và giải quyết các vấn đề kỹ thuật và bảo mật</li>
                    <li>Tuân thủ các nghĩa vụ pháp lý</li>
                </ul>
            </section>

            <section id="information-sharing">
                <h2>4. Chia sẻ thông tin</h2>
                <p>
                    Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba. Tuy nhiên, chúng tôi có thể chia
                    sẻ thông tin trong các trường hợp sau:
                </p>
                <ul>
                    <li>Với các nhà cung cấp dịch vụ giúp chúng tôi vận hành dịch vụ (như dịch vụ thanh toán, lưu
                        trữ đám mây)
                    </li>
                    <li>Khi có yêu cầu pháp lý hoặc để bảo vệ quyền, tài sản hoặc an toàn của chúng tôi hoặc người
                        khác
                    </li>
                    <li>Trong trường hợp sáp nhập, bán tài sản công ty, tài trợ hoặc mua lại toàn bộ hoặc một phần
                        doanh nghiệp của chúng tôi
                    </li>
                    <li>Với sự đồng ý của bạn</li>
                </ul>
            </section>

            <section id="data-security">
                <h2>5. Bảo mật dữ liệu</h2>
                <p>
                    Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ thông tin cá nhân của bạn khỏi mất
                    mát, truy cập trái phép, sử dụng sai mục đích, tiết lộ, thay đổi và phá hủy. Các biện pháp này
                    bao gồm:
                </p>
                <ul>
                    <li>Mã hóa dữ liệu sử dụng công nghệ SSL</li>
                    <li>Kiểm soát truy cập vào hệ thống và dữ liệu</li>
                    <li>Xác thực hai yếu tố cho các tài khoản quản trị</li>
                    <li>Đánh giá bảo mật thường xuyên</li>
                </ul>
                <p>
                    Tuy nhiên, không có phương thức truyền qua internet hoặc phương thức lưu trữ điện tử nào là an
                    toàn 100%. Do đó, mặc dù chúng tôi nỗ lực bảo vệ thông tin cá nhân của bạn, chúng tôi không thể
                    đảm bảo an ninh tuyệt đối.
                </p>
            </section>

            <section id="user-rights">
                <h2>6. Quyền của người dùng</h2>
                <p>
                    Bạn có một số quyền liên quan đến thông tin cá nhân của mình, bao gồm:
                </p>
                <ul>
                    <li>Quyền truy cập và nhận bản sao thông tin cá nhân của bạn</li>
                    <li>Quyền yêu cầu chỉnh sửa hoặc cập nhật thông tin không chính xác</li>
                    <li>Quyền yêu cầu xóa thông tin cá nhân của bạn</li>
                    <li>Quyền hạn chế hoặc phản đối việc xử lý thông tin của bạn</li>
                    <li>Quyền di chuyển dữ liệu</li>
                    <li>Quyền rút lại sự đồng ý</li>
                </ul>
                <p>
                    Để thực hiện bất kỳ quyền nào trong số này, vui lòng liên hệ với chúng tôi theo thông tin liên
                    hệ được cung cấp bên dưới.
                </p>
            </section>

            <section id="cookies">
                <h2>7. Cookie và công nghệ theo dõi</h2>
                <p>
                    Chúng tôi sử dụng cookie và các công nghệ theo dõi tương tự để thu thập và lưu trữ thông tin khi
                    bạn sử dụng dịch vụ của chúng tôi. Cookie là các tệp nhỏ được lưu trữ trên thiết bị của bạn.
                </p>
                <p>
                    Chúng tôi sử dụng cookie cho các mục đích sau:
                </p>
                <ul>
                    <li>Duy trì phiên đăng nhập của bạn</li>
                    <li>Ghi nhớ tùy chọn và cài đặt của bạn</li>
                    <li>Phân tích cách bạn sử dụng trang web của chúng tôi</li>
                    <li>Cải thiện trải nghiệm người dùng</li>
                </ul>
                <p>
                    Bạn có thể kiểm soát cookie thông qua cài đặt trình duyệt của mình. Tuy nhiên, việc vô hiệu hóa
                    cookie có thể ảnh hưởng đến chức năng của dịch vụ chúng tôi.
                </p>
            </section>

            <section id="children-privacy">
                <h2>8. Quyền riêng tư của trẻ em</h2>
                <p>
                    Dịch vụ của chúng tôi không dành cho người dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin
                    cá nhân từ trẻ em dưới 13 tuổi. Nếu bạn là phụ huynh hoặc người giám hộ và bạn biết rằng con bạn
                    đã cung cấp cho chúng tôi thông tin cá nhân, vui lòng liên hệ với chúng tôi để chúng tôi có thể
                    thực hiện các hành động cần thiết.
                </p>
            </section>

            <section id="changes">
                <h2>9. Thay đổi chính sách bảo mật</h2>
                <p>
                    Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn
                    về bất kỳ thay đổi nào bằng cách đăng chính sách mới trên trang này và cập nhật ngày "Cập nhật
                    lần cuối" ở đầu chính sách.
                </p>
                <p>
                    Bạn nên kiểm tra trang này định kỳ để cập nhật về các thay đổi. Những thay đổi trong chính sách
                    này có hiệu lực khi được đăng trên trang này.
                </p>
            </section>

            <section id="contact">
                <h2>10. Liên hệ với chúng tôi</h2>
                <p>
                    Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi:
                </p>
                <ul className="contact-info">
                    <li>Email: privacy@braingame.vn</li>
                    <li>Điện thoại: 0123 456 789</li>
                    <li>Địa chỉ: 123 Đường ABC, Quận XYZ, Hà Nội, Việt Nam</li>
                </ul>
            </section>
        </div>
    </div>);
}

export default PrivacyPage;
