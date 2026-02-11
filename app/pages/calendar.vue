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
        const weekIndex = week.getIndex() - 1;

        // 前面补空（周一到周日，如果第一天是周一weekIndex=0，补0个；周二weekIndex=1，补1个；以此类推）
        for (let i = 0; i < weekIndex; i++) {
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
    <div class="w-full h-screen flex flex-col bg-[rgb(49,57,83)] p-10 items-center overflow-auto calendar-container">
        <!-- 顶部切换按钮 -->
        <div class="flex flex-col gap-5 py-6 px-8 bg-white/10 backdrop-blur-[10px] rounded-2xl mb-8 w-fit">
            <button
                class="flex items-center gap-2 py-3 px-6 bg-white/20 border-2 border-white/30 rounded-lg text-white text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-white/30 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                @click="changeMonth('prev')"
                :disabled="isTransitioning"
            >
                <span class="text-xl font-bold">↑</span>
                <span>上个月</span>
            </button>
            <div class="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                {{ monthDisplay }}
            </div>
        </div>

        <!-- 日历主体 -->
        <div class="relative w-full p-4">
            <div
                class="w-full h-full transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                :class="{
                    'animate-slide-up': slideDirection === 'up' && isTransitioning,
                    'animate-slide-down': slideDirection === 'down' && isTransitioning,
                }"
            >
                <!-- 星期标题 -->
                <div class="grid grid-cols-7 gap-4 mb-4">
                    <div
                        v-for="(weekDay, index) in weekDays"
                        :key="index"
                        class="text-center py-4 text-lg font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                    >
                        {{ weekDay }}
                    </div>
                </div>

                <!-- 日期格子 -->
                <div class="grid grid-cols-7 gap-4 h-[calc(100%-4rem)]">
                    <div
                        v-for="(day, index) in calendarDays"
                        :key="`${currentYear}-${currentMonth}-${index}`"
                        class="relative bg-white/15 backdrop-blur-[10px] border-2 border-white/20 rounded-xl p-4 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden min-h-[80px] md:min-h-[120px]"
                        :class="{
                            'opacity-40 cursor-not-allowed': day && !isCurrentMonth(day),
                            'scale-[1.15] z-10 bg-white/30 border-white/50 shadow-[0_8px_24px_rgba(0,0,0,0.3)]':
                                isHovered(day),
                            'fixed top-0 left-0 right-0 bottom-0 w-screen h-screen scale-100 z-[1000] bg-white/95 backdrop-blur-[20px] border-0 rounded-none p-12 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center':
                                isSelected(day),
                            'opacity-30 cursor-not-allowed pointer-events-none': !day || !isCurrentMonth(day),
                            'hover:bg-white/25 hover:border-white/40': day && isCurrentMonth(day) && !isSelected(day),
                        }"
                        @mouseenter="handleMouseEnter(day)"
                        @mouseleave="handleMouseLeave"
                        @click="handleDayClick(day)"
                    >
                        <!-- 日期数字（左上角） -->
                        <span
                            v-if="day"
                            class="absolute top-3 left-3 text-base md:text-xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] z-[1]"
                            :class="{
                                'text-5xl text-[#667eea] drop-shadow-none static mb-8': isSelected(day),
                            }"
                        >
                            {{ day.getDay() }}
                        </span>

                        <!-- 悬浮时显示的内容 -->
                        <div
                            v-if="isHovered(day)"
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 flex items-center justify-center opacity-80"
                        >
                            <!-- 预留位置，后续补充内容 -->
                        </div>

                        <!-- 选中时显示的内容 -->
                        <div v-if="isSelected(day)" class="w-full h-full flex flex-col items-center justify-center p-8">
                            <!-- 预留位置，后续补充内容 -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部切换按钮 -->
        <button
            class="mt-10 flex items-center gap-2 py-3 px-6 bg-white/20 border-2 border-white/30 rounded-lg text-white text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-white/30 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changeMonth('next')"
            :disabled="isTransitioning"
        >
            <span class="text-xl font-bold">↓</span>
            <span>下个月</span>
        </button>
    </div>
</template>

<style lang="scss" scoped>
.calendar-container {
    &::-webkit-scrollbar {
        display: none;
    }
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

.animate-slide-up {
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-down {
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
