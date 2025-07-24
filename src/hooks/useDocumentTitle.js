import {useEffect} from 'react';

/**
 * Hook để thay đổi title của document
 * @param {string} title - Title mới cho trang web
 * @param {boolean} [resetOnUnmount=false] - Có reset về title mặc định khi unmount không
 */
const useDocumentTitle = (title, resetOnUnmount = false) => {
    const defaultTitle = 'Trò chơi trí tuệ';

    useEffect(() => {
        // Thêm tên trang vào title
        document.title = title ? `${title}` : defaultTitle;

        // Reset title khi component unmount nếu cần
        return () => {
            if (resetOnUnmount) {
                document.title = defaultTitle;
            }
        };
    }, [title, resetOnUnmount]);
};

export default useDocumentTitle;
