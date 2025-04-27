import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 警告：這會允許即使你的專案有 ESLint 錯誤，也能成功完成生產環境建置
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
