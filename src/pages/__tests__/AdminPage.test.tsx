import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPage } from '../AdminPage';
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
const mockLogout = vi.fn();
vi.mock('../../context/AuthContext', async () => {
    return {
        useAuth: vi.fn(),
    };
});

describe('AdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('【前端元素】檢查管理後台初始渲染', () => {
        (useAuth as any).mockReturnValue({
            user: { role: 'admin', username: 'AdminUser' },
            logout: mockLogout,
        });

        render(
            <BrowserRouter>
                <AdminPage />
            </BrowserRouter>
        );

        expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
        expect(screen.getByText('← 返回')).toBeInTheDocument();
        expect(screen.getByText('管理員')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
        expect(screen.getByText('管理員專屬頁面')).toBeInTheDocument();
    });

    it('【function 邏輯】登出功能', async () => {
        const user = userEvent.setup();
        (useAuth as any).mockReturnValue({
            user: { role: 'admin', username: 'AdminUser' },
            logout: mockLogout,
        });

        render(
            <BrowserRouter>
                <AdminPage />
            </BrowserRouter>
        );

        await user.click(screen.getByRole('button', { name: '登出' }));

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
    });

    it('【前端元素】顯示角色徽章', () => {
        (useAuth as any).mockReturnValue({
            user: { role: 'admin', username: 'AdminUser' },
            logout: mockLogout,
        });

        render(
            <BrowserRouter>
                <AdminPage />
            </BrowserRouter>
        );

        const badge = screen.getByText('管理員');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('role-badge', 'admin');
    });
});
