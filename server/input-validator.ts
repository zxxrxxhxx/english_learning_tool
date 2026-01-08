/**
 * 输入验证和XSS防护工具
 */

/**
 * 转义HTML特殊字符，防止XSS攻击
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * 清理用户输入，移除危险字符
 */
export function sanitizeInput(input: string): string {
  // 移除控制字符
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // 限制长度
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized.trim();
}

/**
 * 验证英文单词格式
 */
export function validateEnglishWord(word: string): { valid: boolean; error?: string } {
  if (!word || word.trim().length === 0) {
    return { valid: false, error: "单词不能为空" };
  }
  
  if (word.length > 100) {
    return { valid: false, error: "单词长度不能超过100个字符" };
  }
  
  // 允许字母、连字符、撇号、空格（用于短语）
  const validPattern = /^[a-zA-Z\s'-]+$/;
  if (!validPattern.test(word)) {
    return { valid: false, error: "单词只能包含字母、连字符、撇号和空格" };
  }
  
  return { valid: true };
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: "邮箱不能为空" };
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { valid: false, error: "邮箱格式不正确" };
  }
  
  if (email.length > 320) {
    return { valid: false, error: "邮箱长度不能超过320个字符" };
  }
  
  return { valid: true };
}

/**
 * 验证用户名格式
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: "用户名不能为空" };
  }
  
  if (username.length < 2 || username.length > 50) {
    return { valid: false, error: "用户名长度必须在2-50个字符之间" };
  }
  
  // 允许中文、英文、数字、下划线
  const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
  if (!validPattern.test(username)) {
    return { valid: false, error: "用户名只能包含中文、英文、数字和下划线" };
  }
  
  return { valid: true };
}

/**
 * 检测SQL注入风险
 */
export function detectSqlInjection(input: string): boolean {
  const dangerousPatterns = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bOR\b.*=.*\bOR\b)/i,
    /(\bAND\b.*=.*\bAND\b)/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * 检测XSS攻击风险
 */
export function detectXss(input: string): boolean {
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<img[^>]*onerror/gi,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}
