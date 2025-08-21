import * as React from 'react';

export interface LockIconProps extends React.SVGProps<SVGSVGElement> {
  /** Height in pixels; width defaults to maintain 14:16 aspect ratio. */
  size?: number;
  /** Optional color; defaults to currentColor so it can be styled via className */
  color?: string;
}

const LockIcon: React.FC<LockIconProps> = ({ size = 16, color, className, width, height, ...props }) => {
  const style = color ? { color, ...(props.style || {}) } : props.style;
  const computedHeight = height ?? size;
  const computedWidth = width ?? Math.round((size * 14) / 16);

  return (
    <svg
      width={computedWidth}
      height={computedHeight}
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g clipPath="url(#clip0_222_371)">
        <path
          d="M4.5 4.5V6H9.5V4.5C9.5 3.11875 8.38125 2 7 2C5.61875 2 4.5 3.11875 4.5 4.5ZM2.5 6V4.5C2.5 2.01562 4.51562 0 7 0C9.48438 0 11.5 2.01562 11.5 4.5V6H12C13.1031 6 14 6.89687 14 8V14C14 15.1031 13.1031 16 12 16H2C0.896875 16 0 15.1031 0 14V8C0 6.89687 0.896875 6 2 6H2.5Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_222_371)">
          <path d="M0 0H14V16H0V0Z" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default LockIcon;
