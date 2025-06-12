import { useState, useEffect } from "preact/hooks";
import logoImage from "@/assets/images/icons/logo_square.png";

interface VersionProps {
  latestVer: string | null;
  publishedDate: string | null;
  loading: boolean;
}

const Version = ({ latestVer, publishedDate, loading }: VersionProps) => {
  return (
    <div className="mt-4 p-4 bg-white/5 rounded-lg shadow-md inline-flex items-center gap-4">
      {loading ? (
        <span className="text-sm text-gray-400">正在获取最新版本信息...</span>
      ) : (
        <>
          <img
            src={logoImage.src}
            alt="Class Widgets Logo"
            className="size-8"
          />
          <div>
            <span className="text-lg font-semibold text-white block">最新版本: {latestVer}</span>
            {publishedDate && <span className="text-sm text-gray-400 block">发布日期: {publishedDate}</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default Version;