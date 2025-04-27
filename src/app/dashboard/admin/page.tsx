"use client"
import DashboardLayout from '@/component/layout/dashboardLayout'
import { useState, useEffect, ReactNode } from 'react';
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
    defect_num: 0,
    percentage: 0,
    id: 1,
  });
  const [files, setFiles] = useState<any>(null);

  const [loading, setLoading] = useState(true);


  const [events, setEvents] = useState<{ conversations: { id: string; time: string }[] }>({ conversations: [] });

  
  const production_path = [
    {
      id: "1",
      title: "生產道A",
      description: "發現是溫度過高的問題",
      defection_rate: "10",
      total: "1000",
      defect_num: "100",
      time: "2025-04-26 14:30",
    },
    {
      id: "2",
      title: "生產道B",
      description: "發現是濕度過高，溫度過低的問題",
      defection_rate: "40",
      total: "4000",
      defect_num: "1600",
      time: "2025-04-26 10:00",
    },
    {
      id: "3",
      title: "生產道C",
      description: "發現是某個儀器高度過低，導致在製藥的時候，壓力過高，倒置異常損壞",
      defection_rate: "25",
      total: "1600",
      defect_num: "400",
      time: "2025-04-25 16:45",
    },
  ];


  useEffect(() => {
    setLoading(true);
    fetch('/api/fetch_defect_rate')
      .then(res => res.json())
      .then(data => {
        const contentObj = JSON.parse(data.content);
        setFiles(contentObj);
        
    });
  }, []);

  useEffect(() => {
    if (files !== null) {
      
      const latestBatch = Object.entries(files).reduce<{ key: string; value: any } | null>((latest, [key, value]) => {
        if (!latest || new Date((value as any).start_time) > new Date((latest.value as any).start_time)) {
          return { key, value };
        }
        return latest;
      }, null);
      setTimeout(() => {
        setOrderData({
          total: latestBatch?.value["total"],
          defect_num: Math.round(latestBatch?.value["total"] * (latestBatch?.value["DR"] / 100)),
          percentage: latestBatch?.value["DR"], 
          id: latestBatch?.value["start_time"],
        });
      setLoading(false);
      }, 1000);
    }    
  }, [files]);


  useEffect(() => {
    setLoading(true);
    fetch('/api/fetch_events')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data && data.content) {
          try {
            const contentObj = JSON.parse(data.content);
            setEvents(contentObj); // 注意這裡改成 contentObj
            console.log("解析後的資料:", contentObj);
          } catch (parseError) {
            console.error("JSON 解析錯誤:", parseError);
          }
        } else {
          console.error("回應資料格式不正確");
        }
      })
      .catch(error => {
        console.error("獲取資料失敗:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  return (
    <DashboardLayout userRole="user">
      <h1 className="text-2xl font-semibold text-gray-900">生產線詳情</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* 生產道 */}
        {production_path.map((path) => (
          <Link href={`/dashboard/admin/1`} key={path.id} className="block hover:shadow-lg transition-shadow duration-300">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex flex-col items-center">
                  {/* 標題 */}
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{path.title}</h3>
                  
                  {/* 圓環進度條 */}
                  {loading ? (
                    <div className="animate-pulse h-32 w-32 rounded-full bg-gray-200"></div>
                  ) : (
                    <CircularProgressBar percentage={orderData.percentage} size={150} strokeWidth={15} />
                  )}
                  
                  {/* 訂單數據 */}
                  <div className="mt-4 text-center">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500"></dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <div className="animate-pulse h-6 w-16 bg-gray-200 rounded mx-auto mt-1"></div>
                        ) : (
                          `${orderData.defect_num}/${orderData.total}`
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-center">
                  <div className="font-medium text-indigo-600 hover:text-indigo-500">
                    最新破損率
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

      </div>
      <h1 className="text-2xl font-semibold text-gray-900 mt-10 mb-5">近期系統自動修正事件</h1>
      <div className="w-full mx-auto">
        <div className="flex flex-col gap-4">
          {!loading && events.conversations.map((event: {
            [x: string]: ReactNode; id: string; time: string 
}) => (
            <Link
              href={`/dashboard/admin/event/${event.id}`}
              key={event.id}
              className="block"
            >
              <div className="flex items-center justify-between bg-white shadow rounded-lg px-6 py-4 hover:bg-indigo-50 transition cursor-pointer border border-gray-200">
                <div>
                  <div className="text-lg font-bold text-gray-800">{event.id}</div>
                  <div className="text-gray-600 text-sm mt-1">{event.lambda}</div>
                </div>
                <div className="text-right min-w-[110px]">
                  <span className="text-sm text-gray-500">{event.time}</span>
                </div>
              </div>
            </Link>
          ))}
          {loading && (
            <div className='text-center text-black mt-20'>loading...</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
