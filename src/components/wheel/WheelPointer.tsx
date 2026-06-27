import { useSettingsStore } from '@/store/useSettingsStore';
import type { PointerStyle } from '@/types';

interface WheelPointerProps {
  style?: PointerStyle;
}

/**
 * 固定在轮盘正上方外侧的指针，不随轮盘旋转。
 * 指针尖端指向轮盘 12 点位置（即旋转后的"中奖扇区"）。
 * 尺寸随断点放大，确保桌面端清晰可见。
 */
export function WheelPointer({ style: styleProp }: WheelPointerProps) {
  const settingsStyle = useSettingsStore((s) => s.pointerStyle);
  const style = styleProp ?? settingsStyle;

  const color = 'var(--color-brand-600)';

  // Shared drop shadow for all pointer styles — adds depth so the pointer
  // visually sits above the tilted wheel plane.
  const dropShadow = 'drop-shadow(0 3px 4px rgba(40, 38, 27, 0.35))';

  if (style === 'circle') {
    return (
      <div className="wheel-pointer pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 -top-[18px] lg:-top-[28px]">
        <div
          className="h-9 w-9 rounded-full border-[3px] border-[var(--color-paper-50)] lg:h-14 lg:w-14 lg:border-4"
          style={{ backgroundColor: color, filter: dropShadow }}
        />
      </div>
    );
  }

  if (style === 'arrow') {
    return (
      <div className="wheel-pointer pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 -top-[20px] lg:-top-[32px]">
        <svg
          className="h-[44px] w-[36px] lg:h-[64px] lg:w-[52px]"
          viewBox="0 0 26 32"
          fill="none"
          style={{ filter: dropShadow }}
        >
          <path
            d="M13 30L3 8C3 4 7 1 13 1C19 1 23 4 23 8L13 30Z"
            fill={color}
            stroke="var(--color-paper-50)"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }

  // Default: triangle —— 大三角指针，尖端朝下指向轮盘
  return (
    <div className="wheel-pointer pointer-events-none absolute left-1/2 z-30 flex -translate-x-1/2 flex-col items-center -top-[20px] lg:-top-[32px]">
      <svg
        className="h-[40px] w-[32px] lg:h-[60px] lg:w-[48px]"
        viewBox="0 0 24 28"
        fill="none"
        style={{ filter: dropShadow }}
      >
        <path
          d="M12 27L1 1H23L12 27Z"
          fill={color}
          stroke="var(--color-paper-50)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
