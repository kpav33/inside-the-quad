/**
 * Drawn icons in the drawing's line weight. They sit beside text that already names the action, so
 * they are hidden from assistive technology.
 */

interface IconProps {
  className?: string;
}

function Icon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={['icon', className].filter(Boolean).join(' ')}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** A leader arrow: points right (forward, to another sheet) unless `back`. */
export function ArrowIcon({ back = false, ...props }: IconProps & { back?: boolean }) {
  return (
    <Icon {...props}>
      <path d={back ? 'M14 8H3M7 4 3 8l4 4' : 'M2 8h11M9 4l4 4-4 4'} />
    </Icon>
  );
}

/** "Check this": an exclamation mark in a ring. */
export function CautionIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.5v4.5M8 11v0.75" />
    </Icon>
  );
}

/** "Doesn't fit": a cross. */
export function CrossIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 8.5 6 12l7.5-8" />
    </Icon>
  );
}
