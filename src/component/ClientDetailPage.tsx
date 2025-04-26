"use client"
import DashboardLayout from '@/component/layout/dashboardLayout';
import { useState, useEffect } from 'react';

export default function MedicineDetailPage({ id }: { id: string }) {

  const [files, setFiles] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    setLoading(true);
    fetch('/api/fetch_defect_rate')
      .then(res => res.json())
      .then(data => {
        const contentObj = JSON.parse(data.content);
        setFiles(contentObj);
        console.log(typeof contentObj);
    });
  }, []);

  useEffect(() => {
    if (files !== null) {
      console.log("files", files);
      setLoading(false);
    }    
  }, [files]);


  return (
    <DashboardLayout userRole="user">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">生產道 {id} 詳細情形</h1>
          { !loading && (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
            {/* Block 1: 藥物圖片與詳細資訊 */}
            <div className="w-full max-w-4xl bg-white shadow rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* 藥物圖片 */}
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80"
                  alt="藥物圖片"
                  className="w-36 h-36 object-cover rounded-lg border"
                />
                {/* 詳細資訊 */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">藥物名稱：阿莫西林</h2>
                  <p className="text-gray-700 mb-1">生產批號：AMX-20250425</p>
                  <p className="text-gray-700 mb-1">生產日期：2025-04-25</p>
                  <p className="text-gray-700 mb-1">有效期限：2027-04-25</p>
                  <p className="text-gray-700">生產線：A1</p>
                </div>
              </div>
            </div>
          
            {/* Block 2 & 3: 左下環境參數 + 右下時間軸 */}
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
              {/* Block 2: 環境參數 */}
              <div className="bg-white shadow rounded-lg p-6 flex-1 md:max-w-xs">
                <h3 className="text-lg font-semibold mb-4">最新 batch 情況</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">此梯次總量</span>
                    <span className="font-bold text-gray-900">{files.total}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Defection rate</span>
                    <span className="font-bold text-gray-900">{files.DR}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">溫度</span>
                    <span className="font-bold text-gray-900">{files.T}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">濕度</span>
                    <span className="font-bold text-gray-900">{files.humidity}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">開始時間</span>
                    <span className="font-bold text-gray-900">{files.start_time}</span>
                  </li>
                </ul>
              </div>
          
              {/* Block 3: 時間軸（含圖片/影片） */}
              <div className="bg-white shadow rounded-lg p-6 flex-1">
                <h3 className="text-lg font-semibold mb-4">生產過程時間軸</h3>
                <div className="flex flex-col gap-4">
                  {/* 時間軸項目（可根據資料 map 多個） */}
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                      {/* 時間點 */}
                      <div className="w-24 flex-shrink-0 text-indigo-600 font-bold">
                        {`2025-04-2${item} 10:0${item}:00`}
                      </div>
                      {/* 圖片/影片 */}
                      <div className="flex-1">
                        <img
                          src={`https://picsum.photos/seed/time${item}/200/100`}
                          alt={`時間點${item}圖片`}
                          className="w-full max-w-xs h-24 object-cover rounded border"
                        />
                        {/* 你也可以放 video 或其他內容 */}
                        {/* <video src="..." controls className="w-full max-w-xs h-24 rounded border mt-2" /> */}
                      </div>
                      {/* 查看詳情按鈕 */}
                      <button className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        查看詳情
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
            )
          }
          { loading && (
            <div>
              loading...
            </div>

          )}
        </div>
    </DashboardLayout>
  );
}