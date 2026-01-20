import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '../DashboardPage';
import { useAuth } from '../../context/AuthContext';
import { productApi } from '../../api/productApi';
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

// Mock productApi
vi.mock('../../api/productApi', () => ({
    productApi: {
        getProducts: vi.fn(),
    },
}));

describe('DashboardPage', () => {
    const mockProducts = [
        { id: '1', name: 'Product A', description: 'Desc A', price: 100 },
        { id: '2', name: 'Product B', description: 'Desc B', price: 200 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({
            user: { role: 'user', username: 'TestUser' },
            logout: mockLogout,
        });
    });

    it('【前端元素】檢查儀表板初始渲染', async () => {
        (productApi.getProducts as any).mockResolvedValue(mockProducts);

        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        );

        expect(screen.getByText('儀表板')).toBeInTheDocument();
        // Wait for user name to appear
        await waitFor(() => {
            expect(screen.getByText('Welcome, TestUser 👋')).toBeInTheDocument();
        });
        expect(screen.getByText('一般用戶')).toBeInTheDocument();
        expect(screen.queryByText('🛠️ 管理後台')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
    });

    it('【前端元素】管理員權限顯示', async () => {
        (useAuth as any).mockReturnValue({
            user: { role: 'admin', username: 'AdminUser' },
            logout: mockLogout,
        });
        (productApi.getProducts as any).mockResolvedValue(mockProducts);

        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('管理員')).toBeInTheDocument();
        });
        expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
        expect(screen.getByText('🛠️ 管理後台').closest('a')).toHaveAttribute('href', '/admin');
    });

    it('【Mock API】成功載入商品列表', async () => {
        let resolveProducts: (value: any) => void;
        const productsPromise = new Promise((resolve) => {
            resolveProducts = resolve;
        });
        (productApi.getProducts as any).mockReturnValue(productsPromise);

        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        );

        expect(screen.getByText('載入商品中...')).toBeInTheDocument();

        resolveProducts!(mockProducts);

        await waitFor(() => {
            expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Product A')).toBeInTheDocument();
        expect(screen.getByText('NT$ 100')).toBeInTheDocument();
        expect(screen.getByText('Product B')).toBeInTheDocument();
    });

    it('【Mock API】載入商品失敗', async () => {
        const error = {
            isAxiosError: true,
            response: {
                data: {
                    message: '網路錯誤'
                }
            }
        };
        (productApi.getProducts as any).mockRejectedValue(error);

        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('網路錯誤')).toBeInTheDocument();
        });
        expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
    });

    it('【function 邏輯】登出功能', async () => {
        const user = userEvent.setup();
        (productApi.getProducts as any).mockResolvedValue(mockProducts);

        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        );

        await user.click(screen.getByRole('button', { name: '登出' }));

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
    });
});
