const STEPS = ['Account', 'Personal', 'Address', 'Emergency'] as const;

export function AuthStepIndicator({ current }: { current: number }) {
  return (
    <div className="auth-steps mb-8">
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <span
                    className={`auth-step-line h-0.5 flex-1 ${done || active ? 'auth-step-line-active' : ''}`}
                  />
                )}
                <span
                  className={`auth-step-dot flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    active ? 'auth-step-dot-active' : done ? 'auth-step-dot-done' : 'auth-step-dot-idle'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className={`auth-step-line h-0.5 flex-1 ${done ? 'auth-step-line-active' : ''}`}
                  />
                )}
              </div>
              <span
                className={`hidden text-[10px] font-semibold uppercase tracking-wide sm:block ${
                  active ? 'text-candy-200' : 'text-violet-400/70'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const REGISTER_STEP_COUNT = STEPS.length;
