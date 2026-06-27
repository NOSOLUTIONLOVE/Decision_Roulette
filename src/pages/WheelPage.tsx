import { TopNav } from '@/components/layout/TopNav';
import { EditorialHeader } from '@/components/layout/EditorialHeader';
import { OptionsInput } from '@/components/options/OptionsInput';
import { OptionsList } from '@/components/options/OptionsList';
import { SavePresetDialog } from '@/components/options/SavePresetDialog';
import { WheelStage } from '@/components/wheel/WheelStage';
import { ResultOverlay } from '@/components/result/ResultOverlay';
import { HistoryDrawer } from '@/components/history/HistoryDrawer';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { ShareSheet } from '@/components/share/ShareSheet';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useWheelStore } from '@/store/useWheelStore';
import { useLocaleStore } from '@/store/useLocaleStore';

export default function WheelPage() {
  const options = useWheelStore((s) => s.options);
  const t = useLocaleStore((s) => s.t);

  return (
    <>
      <TopNav />
      <EditorialHeader />

      {/* Scrollable content — 纵向排列：输入 → 选项（完整展开） → 轮盘 */}
      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="flex flex-1 flex-col gap-8 px-5 pb-8 lg:px-8 lg:pb-10">
          {/* 选项面板 */}
          <section className="options-panel rounded-[var(--radius-lg)] p-5 lg:p-6">
            <OptionsInput />
            <div className="mt-4">
              <OptionsList />
            </div>
          </section>

          {/* 轮盘舞台 — 选项 >= 2 时才显示 */}
          {options.length >= 2 ? (
            <div className="flex items-center justify-center">
              <WheelStage />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p
                className="text-[14px] italic text-[var(--color-ink-400)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {t('wheel.emptyHint')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overlays */}
      <ResultOverlay />
      <HistoryDrawer />
      <SettingsPanel />
      <ShareSheet />
      <SavePresetDialog />
      <ConfirmDialog />
    </>
  );
}
