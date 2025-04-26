"use client"
import DashboardLayout from '@/component/layout/dashboardLayout';
import { useState, useEffect } from 'react';

export default function MedicineDetailPage({ id }: { id: string }) {

  const [files, setFiles] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/s3_list')
      .then(res => res.json())
      .then(data => {
        setFiles(JSON.stringify(data));
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout userRole="user">
        <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">藥物破損詳細報告</h1>
        <h1>{JSON.parse(files)?.content || "No content available"}</h1>
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">破損統計</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-700">按月份統計</h3>
                {/* 這裡可以放圖表或詳細數據 */}
                <p className="mt-2">1月: 12%, 2月: 8%, 3月: 15%...</p>
            </div>
            
            <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-700">按藥物類型統計</h3>
                {/* 這裡可以放圖表或詳細數據 */}
                <p className="mt-2">抗生素: 5%, 止痛藥: 10%, 維生素: 3%...</p>
            </div>
            </div>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">破損原因分析</h2>
            <ul className="list-disc pl-5 space-y-2">
            <li>運輸過程震動 (45%)</li>
            <li>不當儲存溫度 (30%)</li>
            <li>包裝問題 (15%)</li>
            <li>其他原因 (10%)</li>
            </ul>
            
            <div className="mt-8">
            {/* <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => window.history.back()}
            >
                返回儀表板
            </button> */}
            </div>
        </div>
        </div>
    </DashboardLayout>
  );
}