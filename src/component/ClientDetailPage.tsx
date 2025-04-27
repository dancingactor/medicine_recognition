"use client"
import DashboardLayout from '@/component/layout/dashboardLayout';
import { useState, useEffect } from 'react';

export default function MedicineDetailPage({ id }: { id: string }) {

  const [files, setFiles] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState<{ key: string; value: any } | null>(null);

  const [showAll, setShowAll] = useState(false);
  const [dataArray, setDataArray] = useState<[string, any][]>([]);
  
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
      const latestBatch = Object.entries(files).reduce<{ key: string; value: any } | null>((latest, [key, value]) => {
        if (!latest || new Date((value as any).start_time) > new Date((latest.value as any).start_time)) {
          return { key, value };
        }
        return latest;
      }, null);
      setLatest(latestBatch);
      console.log("files", files);
      setDataArray(Object.entries(files)); // 使用 setState 更新数据
      console.log("dataArray", dataArray);
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
                  src="/production_line.jpeg"
                  alt="藥物圖片"
                  className="w-36 h-36 object-cover rounded-lg border"
                />
                {/* 詳細資訊 */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">生產線 A</h2>
                  <p className="text-gray-700 mb-1">設備批號：AMX-20250425</p>
                  <p className="text-gray-700 mb-1">生產日期：2025-04-25</p>
                  <p className="text-gray-700 mb-1">生產廠：新北五股區</p>
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
                    <span className="font-bold text-gray-900">{latest?.value?.total}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Defection rate</span>
                    <span className="font-bold text-gray-900">{latest?.value?.DR}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">溫度</span>
                    <span className="font-bold text-gray-900">{latest?.value?.T}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">濕度</span>
                    <span className="font-bold text-gray-900">{latest?.value?.humidity}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">開始時間</span>
                    <span className="font-bold text-gray-900">{latest?.value?.start_time}</span>
                  </li>
                </ul>
              </div>
          
              {/* Block 3: 時間軸（含圖片/影片） */}
              <div className="bg-white shadow rounded-lg p-6 flex-1">
                <h3 className="text-lg font-semibold mb-4">歷史紀錄</h3>
                <div className="flex flex-col gap-4">
                  {!loading && (
                    <div className="flex flex-col gap-4">
                      {/* 只顯示前三個或全部記錄 */}
                      {dataArray?.slice(0, showAll ? undefined : 3).map(([string, value]) => (
                        <div key={string} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                          {/* 時間點 */}
                          <div className="w-24 flex-shrink-0 text-indigo-600 font-bold">
                            {string}
                          </div>
                          {/* 圖片/影片 */}
                          <div className="flex-1">
                            <div className="flex flex-col">
                              <span>總量: {value.total}</span>
                              <span>不良率: {value.DR}%</span>
                            </div>
                          </div>
                          {/* 查看詳情按鈕 */}
                          <button className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                            查看詳情
                          </button>
                        </div>
                      ))}
                      
                      {/* 查看更多按鈕 */}
                      {dataArray && dataArray.length > 3 && (
                        <button 
                          onClick={() => setShowAll(!showAll)}
                          className="mt-4 w-full py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                        >
                          {showAll ? '顯示較少' : `查看更多 (${dataArray.length - 3} 筆)`}
                        </button>
                      )}
                    </div>
                  )}
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