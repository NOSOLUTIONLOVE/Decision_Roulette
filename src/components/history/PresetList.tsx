import { Trash2, Bookmark, Sparkles, LoaderCircle } from 'lucide-react';
import type { Preset } from '@/types';
import { usePresets } from '@/hooks/useHistory';
import { useWheelStore } from '@/store/useWheelStore';
import { useUIStore } from '@/store/useUIStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import * as presetRepo from '@/db/presetRepository';

/**
 * List of saved option presets. Clicking a preset (or its "载入转盘" button)
 * loads its options into the wheel via `useWheelStore.loadPreset` and closes
 * the drawer.
 */
export function PresetList() {
  const { data: presets, isLoading } = usePresets();
  const loadPreset = useWheelStore((s) => s.loadPreset);
  const setHistoryOpen = useUIStore((s) => s.setHistoryOpen);
  const t = useLocaleStore((s) => s.t);

  // 加载中：显示轻量加载提示，避免短暂闪现空状态
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <LoaderCircle
          size={24}
          strokeWidth={1.5}
          className="animate-spin text-[var(--color-ink-300)]"
        />
        <p
          className="mt-4 text-[12px] text-[var(--color-ink-400)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('preset.loading')}
        </p>
      </div>
    );
  }

  // 空状态：加载完成但无数据，显示引导文案
  if (!presets || presets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bookmark size={32} strokeWidth={1.2} className="text-[var(--color-ink-300)]" />
        <p
          className="mt-4 text-[13px] text-[var(--color-ink-500)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('preset.empty')}
        </p>
        <p
          className="mt-1.5 text-[11px] text-[var(--color-ink-400)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('preset.emptyHint')}
        </p>
      </div>
    );
  }

  const handleLoad = (options: Preset['options']) => {
    loadPreset(options);
    setHistoryOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pt-1.5">
      <span
        className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-400)]"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        {t('preset.count', { count: presets.length })}
      </span>

      {presets.map((preset) => (
        <article
          key={preset.id ?? preset.createdAt}
          className="rounded-[var(--radius-md)] border border-[var(--color-line-300)] bg-[var(--color-paper-50)] p-4 transition-colors hover:border-[var(--color-brand-300)]"
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleLoad(preset.options)}
              className="min-w-0 flex-1 text-left"
            >
              <p
                className="truncate text-[15px] text-[var(--color-ink-800)]"
                style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
              >
                {preset.name}
              </p>
              <p
                className="mt-1 text-[11px] text-[var(--color-ink-400)]"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {t('preset.optionCount', { count: preset.options.length })}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                if (preset.id !== undefined) void presetRepo.remove(preset.id);
              }}
              className="shrink-0 text-[var(--color-ink-400)] transition-colors hover:text-[var(--color-brand-500)]"
              aria-label={t('preset.deleteAria')}
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* option color-dot preview */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {preset.options.slice(0, 8).map((opt) => (
              <span
                key={opt.id}
                className="h-2 w-2 rounded-full"
                style={{ background: opt.color }}
                title={opt.text}
                aria-hidden
              />
            ))}
            {preset.options.length > 8 && (
              <span
                className="text-[10px] text-[var(--color-ink-400)]"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                +{preset.options.length - 8}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleLoad(preset.options)}
            className="mt-3.5 flex w-full items-center justify-center gap-2.5 rounded-[var(--radius-sm)] bg-[var(--color-brand-100)] py-2.5 text-[12px] text-[var(--color-brand-600)] transition-colors hover:bg-[var(--color-brand-200)]"
            style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
          >
            <Sparkles size={12} strokeWidth={1.5} />
            {t('preset.load')}
          </button>
        </article>
      ))}
    </div>
  );
}
