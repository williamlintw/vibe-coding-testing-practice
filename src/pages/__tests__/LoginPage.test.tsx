import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';
import { useAuth } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock AuthContext
const mockLogin = vi.fn();
const mockClearAuthExpiredMessage = vi.fn();
vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext');
    return {
        ...actual,
        useAuth: vi.fn(),
    };
});

describe('LoginPage', () => {
    const defaultAuthContext = {
        login: mockLogin,
        isAuthenticated: false,
        authExpiredMessage: '',
        clearAuthExpiredMessage: mockClearAuthExpiredMessage,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue(defaultAuthContext);
    });

    it('【前端元素】檢查登入頁面初始渲染', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(screen.getByText('歡迎回來')).toBeInTheDocument();
        expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
    });

    it('【function 邏輯】驗證 Email 格式錯誤', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        await user.type(screen.getByLabelText('電子郵件'), 'invalid-email');
        await user.click(screen.getByRole('button', { name: '登入' }));

        expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('【function 邏輯】驗證密碼長度不足', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        await user.type(screen.getByLabelText('電子郵件'), 'valid@example.com');
        await user.type(screen.getByLabelText('密碼'), '1234567');
        await user.click(screen.getByRole('button', { name: '登入' }));

        expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('【function 邏輯】驗證密碼缺少英文字母或數字', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        await user.type(screen.getByLabelText('電子郵件'), 'valid@example.com');
        await user.type(screen.getByLabelText('密碼'), '12345678'); // only numbers
        await user.click(screen.getByRole('button', { name: '登入' }));

        expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('【Mock API】模擬登入成功', async () => {
        const user = userEvent.setup();
        let resolveLogin: () => void;
        const loginPromise = new Promise<void>((resolve) => {
            resolveLogin = resolve;
        });
        mockLogin.mockReturnValue(loginPromise);

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        await user.type(screen.getByLabelText('電子郵件'), 'user@example.com');
        await user.type(screen.getByLabelText('密碼'), 'password123');
        await user.click(screen.getByRole('button', { name: '登入' }));

        // Check loading state while promise is pending
        expect(screen.getByRole('button')).toHaveTextContent('登入中...');
        expect(screen.getByRole('button')).toBeDisabled();

        // Resolve the login promise
        await waitFor(async () => {
            resolveLogin();
        });

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    it('【Mock API】模擬登入失敗 (API 錯誤)', async () => {
        const user = userEvent.setup();
        // Mock Axios error structure
        const error = {
            isAxiosError: true,
            response: {
                data: {
                    message: '帳號或密碼錯誤'
                }
            }
        };
        mockLogin.mockRejectedValueOnce(error);

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        await user.type(screen.getByLabelText('電子郵件'), 'user@example.com');
        await user.type(screen.getByLabelText('密碼'), 'wrongpassword123');
        await user.click(screen.getByRole('button', { name: '登入' }));

        await waitFor(() => {
            expect(screen.getByText('帳號或密碼錯誤')).toBeInTheDocument();
        });
    });

    it('【驗證權限】已登入狀態自動導向', () => {
        (useAuth as any).mockReturnValue({
            ...defaultAuthContext,
            isAuthenticated: true,
        });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('【function 邏輯】顯示登入過期訊息', () => {
        (useAuth as any).mockReturnValue({
            ...defaultAuthContext,
            authExpiredMessage: '連線逾時，請重新登入',
        });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(screen.getByText('連線逾時，請重新登入')).toBeInTheDocument();
        expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
    });
});
