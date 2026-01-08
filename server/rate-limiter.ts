/**
 * API限流中间件
 * 防止恶意刷量和滥用
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// 存储限流记录（生产环境应使用Redis）
const rateLimitStore = new Map<string, RateLimitRecord>();

// 清理过期记录的定时器
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, record] of entries) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

export interface RateLimitOptions {
  /**
   * 时间窗口内允许的最大请求数
   */
  maxRequests: number;
  
  /**
   * 时间窗口（毫秒）
   */
  windowMs: number;
  
  /**
   * 限流键生成函数（默认使用IP地址）
   */
  keyGenerator?: (identifier: string) => string;
}

/**
 * 检查是否超过限流
 * @param identifier 标识符（如IP地址或用户ID）
 * @param options 限流配置
 * @returns 是否允许请求
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = options.keyGenerator ? options.keyGenerator(identifier) : identifier;
  const now = Date.now();
  
  let record = rateLimitStore.get(key);
  
  // 如果没有记录或已过期，创建新记录
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    rateLimitStore.set(key, record);
    
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: record.resetTime,
    };
  }
  
  // 检查是否超过限制
  if (record.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }
  
  // 增加计数
  record.count++;
  
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * 获取客户端IP地址
 */
export function getClientIp(req: any): string {
  // 尝试从各种header中获取真实IP
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = forwarded.split(",");
    return ips[0].trim();
  }
  
  return (
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

/**
 * 预设的限流配置
 */
export const RateLimitPresets = {
  // 查询API：每分钟30次
  search: {
    maxRequests: 30,
    windowMs: 60 * 1000,
  },
  
  // 提交API：每分钟5次
  submit: {
    maxRequests: 5,
    windowMs: 60 * 1000,
  },
  
  // 登录API：每5分钟10次
  auth: {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
  },
  
  // 管理API：每分钟60次
  admin: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
};
