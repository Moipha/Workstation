import { ref } from 'vue';

/**
 * 防抖逻辑：在 delay 毫秒内无新调用时才执行
 * @param fn 要防抖的函数
 * @param delay 延迟毫秒数
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number,
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
}
