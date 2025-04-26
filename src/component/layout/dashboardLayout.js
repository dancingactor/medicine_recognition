
// components/layout/DashboardLayout.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children, userRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // 根據用戶角色定義不同的導航項目
  const navigationItems = userRole === 'admin' 
    ? [
        { name: '儀表板', href: '/dashboard/admin', icon: 'HomeIcon' },
        { name: '用戶管理', href: '/dashboard/admin/users', icon: 'UsersIcon' },
        { name: '內容管理', href: '/dashboard/admin/content', icon: 'DocumentTextIcon' },
        { name: '系統設置', href: '/dashboard/admin/settings', icon: 'CogIcon' },
        { name: '數據分析', href: '/dashboard/admin/analytics', icon: 'ChartBarIcon' },
      ]
    : [
        { name: '儀表板', href: '/dashboard/user', icon: 'HomeIcon' },
        { name: '個人資料', href: '/dashboard/user/profile', icon: 'UserIcon' },
        { name: '我的訂單', href: '/dashboard/user/orders', icon: 'ShoppingBagIcon' },
        { name: '收藏列表', href: '/dashboard/user/favorites', icon: 'HeartIcon' },
        { name: '幫助中心', href: '/dashboard/user/help', icon: 'QuestionMarkCircleIcon' },
      ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* 移動裝置側邊欄 */}
      <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-40 flex`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-700">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">關閉側邊欄</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <span className="text-white text-xl font-bold">{userRole === 'admin' ? '管理員面板' : '用戶中心'}</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    router.pathname === item.href
                      ? 'bg-indigo-800 text-white'
                      : 'text-white hover:bg-indigo-600'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-10 w-10 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${userRole}&background=random`}
                  alt=""
                />
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-white">
                  {userRole === 'admin' ? '管理員' : '用戶'}
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="text-sm font-medium text-indigo-200 hover:text-white"
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 桌面版側邊欄 */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-indigo-700">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-white text-xl font-bold">{userRole === 'admin' ? '管理員面板' : '用戶中心'}</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      router.pathname === item.href
                        ? 'bg-indigo-800 text-white'
                        : 'text-white hover:bg-indigo-600'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src={`https://ui-avatars.com/api/?name=${userRole}&background=random`}
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {userRole === 'admin' ? '管理員' : '用戶'}
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="text-xs font-medium text-indigo-200 hover:text-white"
                  >
                    登出
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">打開側邊欄</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
