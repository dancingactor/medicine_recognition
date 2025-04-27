"use client"
import { useState, useEffect } from 'react';
import DashboardLayout from './layout/dashboardLayout';

interface EventData {
  lambda: string;
  LLM: string;
  [key: string]: any;
}

export default function EventDetail({ id }: { id: string }) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ id });
    
    fetch(`/api/fetch_events?${params}`)
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
            // 假設我們直接拿到單一對話的資料
            console.log(contentObj)
            setEvent(contentObj);
          } catch (parseError) {
            console.error("JSON 解析錯誤:", parseError);
          }
        }
      })
      .catch(error => {
        console.error("獲取資料失敗:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="user">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-8 text-center text-gray-800">生產線事件詳情</h1>
          
          {event ? (
            <div className="space-y-8">
              {/* 系統提示區塊 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-indigo-500 text-white rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">系統</h3>
                  <p className="text-gray-600 leading-relaxed">{event.lambda}</p>
                </div>
              </div>

              {/* AI 回應區塊 */}
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className="flex-shrink-0 bg-green-500 text-white rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 bg-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">AI 回應</h3>
                  <p className="text-gray-600 leading-relaxed">{event.LLM}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              找不到對應的事件資料
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}