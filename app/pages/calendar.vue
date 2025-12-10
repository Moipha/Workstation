<script setup lang="ts">
import { ref, computed } from 'vue';
import { SolarMonth, SolarDay } from 'tyme4ts';

// 当前显示的月份
const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);

// 选中的日期
const selectedDay = ref<SolarDay | null>(null);
// 悬浮的日期
const hoveredDay = ref<SolarDay | null>(null);
// 动画方向：'up' | 'down'
const slideDirection = ref<'up' | 'down'>('down');
// 是否正在切换月份
const isTransitioning = ref(false);

// 生成日历数据
const calendarDays = computed(() => {
    const month = SolarMonth.fromYm(currentYear.value, currentMonth.value);
    const days = month.getDays();

    // 创建日历数组，前面补空位
    const calendar: (SolarDay | null)[] = [];

    if (days.length > 0) {
        // 获取第一天是星期几
        const firstDay = days[0]!;
        const week = firstDay.getWeek();
        // Week的索引：0=周一，1=周二，...，6=周日
        const weekIndex = week.getIndex();
        // 转换为周一到周日（1=周一，7=周日）
        // weekIndex: 0-6 对应 周一-周日
        // 需要转换为：1-7 对应 周一-周日
        const firstDayWeekAdjusted = weekIndex + 1;

        // 前面补空（周一到周日，所以如果第一天是周二，前面补1个空位）
        for (let i = 1; i < firstDayWeekAdjusted; i++) {
            calendar.push(null);
        }
    }

    // 添加当前月的日期
    days.forEach(day => {
        calendar.push(day);
    });

    // 补齐到7的倍数（6行）
    while (calendar.length < 42) {
        calendar.push(null);
    }

    return calendar;
});

// 切换月份
const changeMonth = (direction: 'prev' | 'next') => {
    if (isTransitioning.value) return;

    isTransitioning.value = true;
    slideDirection.value = direction === 'prev' ? 'down' : 'up';

    const newDate = new Date(currentDate.value);
    if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
    } else {
        newDate.setMonth(newDate.getMonth() + 1);
    }

    setTimeout(() => {
        currentDate.value = newDate;
        selectedDay.value = null;
        hoveredDay.value = null;

        setTimeout(() => {
            isTransitioning.value = false;
        }, 50);
    }, 300);
};

// 判断是否为当前月
const isCurrentMonth = (day: SolarDay | null) => {
    if (!day) return false;
    return day.getYear() === currentYear.value && day.getMonth() === currentMonth.value;
};

// 处理格子悬浮
const handleMouseEnter = (day: SolarDay | null) => {
    if (!day || !isCurrentMonth(day)) return;
    hoveredDay.value = day;
};

// 处理格子离开
const handleMouseLeave = () => {
    hoveredDay.value = null;
};

// 处理格子点击
const handleDayClick = (day: SolarDay | null) => {
    if (!day || !isCurrentMonth(day)) return;

    if (selectedDay.value && selectedDay.value.toString() === day.toString()) {
        // 如果点击的是已选中的，则取消选中
        selectedDay.value = null;
    } else {
        selectedDay.value = day;
    }
};

// 判断格子是否被选中
const isSelected = (day: SolarDay | null) => {
    if (!day || !selectedDay.value) return false;
    return day.toString() === selectedDay.value.toString();
};

// 判断格子是否被悬浮
const isHovered = (day: SolarDay | null) => {
    if (!day || !hoveredDay.value) return false;
    return day.toString() === hoveredDay.value.toString();
};

// 格式化月份显示
const monthDisplay = computed(() => {
    return `${currentYear.value}年${currentMonth.value}月`;
});

// 星期标题
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
</script>

<template>
    <div class="calendar-container">
        <!-- 顶部切换按钮 -->
        <div class="calendar-nav-top">
            <button class="nav-button" @click="changeMonth('prev')" :disabled="isTransitioning">
                <span class="nav-icon">↑</span>
                <span class="nav-text">上个月</span>
            </button>
            <div class="month-display">{{ monthDisplay }}</div>
            <button class="nav-button" @click="changeMonth('next')" :disabled="isTransitioning">
                <span class="nav-text">下个月</span>
                <span class="nav-icon">↓</span>
            </button>
        </div>

        <!-- 日历主体 -->
        <div class="calendar-wrapper">
            <div
                class="calendar-grid-container"
                :class="{
                    'slide-up': slideDirection === 'up' && isTransitioning,
                    'slide-down': slideDirection === 'down' && isTransitioning,
                }"
            >
                <!-- 星期标题 -->
                <div class="week-header">
                    <div v-for="(weekDay, index) in weekDays" :key="index" class="week-day-header">
                        {{ weekDay }}
                    </div>
                </div>

                <!-- 日期格子 -->
                <div class="calendar-grid">
                    <div
                        v-for="(day, index) in calendarDays"
                        :key="`${currentYear}-${currentMonth}-${index}`"
                        class="calendar-cell"
                        :class="{
                            'not-current-month': day && !isCurrentMonth(day),
                            'is-hovered': isHovered(day),
                            'is-selected': isSelected(day),
                            disabled: !day || !isCurrentMonth(day),
                        }"
                        @mouseenter="handleMouseEnter(day)"
                        @mouseleave="handleMouseLeave"
                        @click="handleDayClick(day)"
                    >
                        <!-- 日期数字（左上角） -->
                        <span v-if="day" class="date-number">
                            {{ day.getDay() }}
                        </span>

                        <!-- 悬浮时显示的内容 -->
                        <div v-if="isHovered(day)" class="hover-content">
                            <!-- 预留位置，后续补充内容 -->
                        </div>

                        <!-- 选中时显示的内容 -->
                        <div v-if="isSelected(day)" class="selected-content">
                            <!-- 预留位置，后续补充内容 -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部切换按钮 -->
        <div class="calendar-nav-bottom">
            <button class="nav-button" @click="changeMonth('prev')" :disabled="isTransitioning">
                <span class="nav-icon">↑</span>
                <span class="nav-text">上个月</span>
            </button>
            <div class="month-display">{{ monthDisplay }}</div>
            <button class="nav-button" @click="changeMonth('next')" :disabled="isTransitioning">
                <span class="nav-text">下个月</span>
                <span class="nav-icon">↓</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.calendar-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
    overflow: hidden;
}

.calendar-nav-top,
.calendar-nav-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    margin-bottom: 2rem;
}

.calendar-nav-bottom {
    margin-top: 2rem;
    margin-bottom: 0;
}

.nav-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 0.5rem;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.nav-icon {
    font-size: 1.2rem;
    font-weight: bold;
}

.month-display {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.calendar-wrapper {
    flex: 1;
    overflow: hidden;
    position: relative;
}

.calendar-grid-container {
    width: 100%;
    height: 100%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-grid-container.slide-up {
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-grid-container.slide-down {
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
    0% {
        transform: translateY(0);
        opacity: 1;
    }
    50% {
        transform: translateY(-20px);
        opacity: 0.5;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideDown {
    0% {
        transform: translateY(0);
        opacity: 1;
    }
    50% {
        transform: translateY(20px);
        opacity: 0.5;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

.week-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
}

.week-day-header {
    text-align: center;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1rem;
    height: calc(100% - 4rem);
}

.calendar-cell {
    position: relative;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    min-height: 120px;
}

.calendar-cell.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
}

.calendar-cell.not-current-month {
    opacity: 0.4;
    cursor: not-allowed;
}

.calendar-cell:not(.disabled):not(.not-current-month):hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
}

.calendar-cell.is-hovered {
    transform: scale(1.15);
    z-index: 10;
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.calendar-cell.is-selected {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    transform: scale(1);
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: none;
    border-radius: 0;
    padding: 3rem;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.date-number {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    z-index: 1;
}

.calendar-cell.is-selected .date-number {
    font-size: 3rem;
    color: #667eea;
    text-shadow: none;
    position: static;
    margin-bottom: 2rem;
}

.hover-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
}

.selected-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .calendar-container {
        padding: 1rem;
    }

    .calendar-cell {
        min-height: 80px;
    }

    .date-number {
        font-size: 1rem;
    }
}
</style>
