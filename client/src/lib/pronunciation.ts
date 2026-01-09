/**
 * 单词发音服务
 * 优先使用浏览器原生Web Speech API，备选方案使用第三方服务
 */

/**
 * 使用浏览器原生TTS播放单词发音
 */
export function speakWord(word: string, accent: 'en-US' | 'en-GB' = 'en-US'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('浏览器不支持语音合成'));
      return;
    }

    // 取消当前正在播放的语音
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = accent;
    utterance.rate = 0.8; // 稍慢一点，更清晰
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`语音播放失败: ${event.error}`));

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * 获取第三方发音音频URL（备选方案）
 * 使用免费的在线词典API
 */
export function getPronunciationAudioUrl(word: string, accent: 'us' | 'uk' = 'us'): string {
  // 使用有道词典的公开音频接口
  const type = accent === 'us' ? '1' : '2';
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`;
}

/**
 * 播放第三方发音音频
 */
export function playPronunciationAudio(word: string, accent: 'us' | 'uk' = 'us'): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(getPronunciationAudioUrl(word, accent));
    
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('音频加载失败'));
    
    audio.play().catch(reject);
  });
}

/**
 * 智能发音：优先使用第三方音频，失败时降级到浏览器TTS
 */
export async function smartSpeak(word: string, accent: 'us' | 'uk' = 'us'): Promise<void> {
  try {
    // 优先使用第三方音频（音质更好）
    await playPronunciationAudio(word, accent);
  } catch (error) {
    console.warn('第三方发音失败，降级到浏览器TTS:', error);
    // 降级到浏览器原生TTS
    const lang = accent === 'us' ? 'en-US' : 'en-GB';
    await speakWord(word, lang);
  }
}

/**
 * 检查浏览器是否支持语音合成
 */
export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}
