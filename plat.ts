// 安全的平台检测（兼容服务器端渲染）
export const detectPlatformFromUserAgent = (): string => {
  console.log(`plat`);
  // 确保在客户端环境下执行
  const platform = navigator.platform.toLowerCase();
  if (platform.includes("win")) {
    console.log(`win`);
    return "windows";
  }
  if (platform.includes("mac")) {
    console.log(`mac`);
    return "macos";
  }
  if (platform.includes("linux")) {
    console.log(`linux`);
    return "linux";
  }
  console.log(`other`);
  return "windows"; // 默认值
};
