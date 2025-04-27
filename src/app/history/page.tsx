"use client"
import DashboardLayout from '@/component/layout/dashboardLayout'
import { useState, useEffect, use, ReactNode } from 'react';
import  Link  from 'next/link'


export default function historyFile(){

    const [loading, setLoading] = useState(true);

    const [events, setEvents] = useState<{ conversations: { id: string; time: string }[] }>({ conversations: [] });

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
          <h1 className="text-2xl font-semibold text-gray-900 mt-10 mb-5">系統自動修正事件</h1>
          <div className="w-full mx-auto">
            <div className="flex flex-col gap-4">
              {events.conversations.map((event: {
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
            </div>
          </div>
        </DashboardLayout>
      );
}