"use client"
import DashboardLayout from '@/component/layout/dashboardLayout'
import { useState, useEffect } from 'react';
import  Link  from 'next/link'
const CircularProgressBar: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({ percentage, size = 120, strokeWidth = 10 }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    // 重置為0，確保每次重新整理都從0開始動畫
    setAnimatedPercentage(0);
    
    // 設定動畫的定時器
    const timer = setTimeout(() => {
      const animationDuration = 1500; // 動畫持續時間（毫秒）
      const steps = 60; // 動畫步數
      const increment = percentage / steps;
      let currentPercentage = 0;
      
      const intervalId = setInterval(() => {
        currentPercentage += increment;
        if (currentPercentage >= percentage) {
          clearInterval(intervalId);
          setAnimatedPercentage(percentage);
        } else {
          setAnimatedPercentage(currentPercentage);
        }
      }, animationDuration / steps);
      
      return () => clearInterval(intervalId);
    }, 200); // 稍微延遲開始動畫，讓用戶能看到動畫效果
    
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="circular-progress-bar"
      >
        {/* 背景圓環 */}
        <circle
          className="text-gray-200 stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        {/* 進度圓環 */}
        <circle
          className="text-blue-500 stroke-current"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={`${circumference}px`}
          strokeDashoffset={`${offset}px`}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
        {/* 中間文字 */}
        <text 
          x="50%" 
          y="50%" 
          dy=".3em"
          textAnchor="middle" 
          className="text-xl font-bold fill-gray-900"
        >
          {Math.round(animatedPercentage)}%
        </text>
      </svg>
    </div>
  );
};


export default function UserDashboard() {
  const [orderData, setOrderData] = useState({
    total: 100,
    completed: 0,
    percentage: 0,
    id: 1,
  });

  const [orderIds, setOrderIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 在客戶端生成隨機訂單 ID
    const newOrderIds = Array(3).fill(0).map(() => Math.floor(Math.random() * 10000));
    setOrderIds(newOrderIds);
  }, []);




  
  // 模擬從API獲取數據
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);


        // 這裡替換成實際的API調用
        // 抓資料 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEgBX1SIgI0lStsgY7HnVNJWId9EhYF5Ku7mFZ7eRcTA ian52759@gmail.comc
        // const response = await fetch('/api/orders/stats');
        // const data = await response.json();
        
        // 模擬API響應
        setTimeout(() => {
          const mockData = {
            total: 100,
            completed: 65,
            id: 1,
          };
          
          setOrderData({
            total: mockData.total,
            completed: mockData.completed,
            percentage: Math.round((mockData.completed / mockData.total) * 100),
            id: mockData.id,
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('獲取訂單數據失敗:', error);
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);
  return (
    <DashboardLayout userRole="user">
      <h1 className="text-2xl font-semibold text-gray-900">生產道詳情</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* 卡片 1 - 我的訂單 */}
        <Link href={`/dashboard/user/${orderData.id}`} className="block hover:shadow-lg transition-shadow duration-300">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex flex-col items-center">
                {/* 標題 */}
                <h3 className="text-lg font-medium text-gray-900 mb-4">藥物破損率</h3>
                
                {/* 圓環進度條 */}
                {loading ? (
                  <div className="animate-pulse h-32 w-32 rounded-full bg-gray-200"></div>
                ) : (
                  <CircularProgressBar percentage={orderData.percentage} size={150} strokeWidth={15} />
                )}
                
                {/* 訂單數據 */}
                <div className="mt-4 text-center">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">已完成訂單</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {loading ? (
                        <div className="animate-pulse h-6 w-16 bg-gray-200 rounded mx-auto mt-1"></div>
                      ) : (
                        `${orderData.completed}/${orderData.total}`
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-center">
                <div className="font-medium text-indigo-600 hover:text-indigo-500">
                  破損率 64%
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* 卡片 2 - 我的收藏 */}
        {/* <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">我的收藏</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">8</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">查看收藏列表</Link>
            </div>
          </div>
        </div> */}

        {/* 卡片 3 - 優惠券 */}
        {/* <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">可用優惠券</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">3</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">查看所有優惠券</Link>
            </div>
          </div>
        </div>
      </div> */}

      {/* 最近訂單 */}
      {/* <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900">最近訂單</h2>
        <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3].map((item) => (
              <li key={item}>
                <Link href="#" className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        訂單 #{Math.floor(Math.random() * 10000)}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          已完成
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          產品 #{item} - ${Math.floor(Math.random() * 100) + 10}.99
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p>
                          {`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate() - item * 2).padStart(2, '0')}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div> */}

      {/* 推薦商品 */}
      {/* <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900">為您推薦</h2>
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                  <img src={`https://picsum.photos/seed/${item}/300/300`} alt="Product" className="object-center object-cover" />
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">推薦商品 #{item}</h3>
                  <p className="mt-1 text-sm text-gray-500">這是一個很棒的商品描述</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">${Math.floor(Math.random() * 100) + 10}.99</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
      </div>
    </DashboardLayout>
  );
}
