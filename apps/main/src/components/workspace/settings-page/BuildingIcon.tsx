import * as React from 'react';

export interface BuildingIconProps extends React.SVGProps<SVGSVGElement> {
  /** Height in pixels; width will default to height * 0.5 to preserve 12x24 aspect. */
  size?: number;
  /** Optional color; defaults to currentColor so it can be styled via className */
  color?: string;
}

const BuildingIcon: React.FC<BuildingIconProps> = ({ size = 24, color, className, width, height, ...props }) => {
  const style = color ? { color, ...(props.style || {}) } : props.style;
  const computedHeight = height ?? size;
  const computedWidth = width ?? size * 0.5; // maintain 12:24 aspect ratio

  return (
    <svg
      width={computedWidth}
      height={computedHeight}
      viewBox="0 0 12 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path />
      <g clipPath="url(#clip0_222_364)">
        <path
          d="M1.5 4C0.671875 4 0 4.67188 0 5.5V18.5C0 19.3281 0.671875 20 1.5 20H4.5V17.5C4.5 16.6719 5.17188 16 6 16C6.82812 16 7.5 16.6719 7.5 17.5V20H10.5C11.3281 20 12 19.3281 12 18.5V5.5C12 4.67188 11.3281 4 10.5 4H1.5ZM2 11.5C2 11.225 2.225 11 2.5 11H3.5C3.775 11 4 11.225 4 11.5V12.5C4 12.775 3.775 13 3.5 13H2.5C2.225 13 2 12.775 2 12.5V11.5ZM5.5 11H6.5C6.775 11 7 11.225 7 11.5V12.5C7 12.775 6.775 13 6.5 13H5.5C5.225 13 5 12.775 5 12.5V11.5C5 11.225 5.225 11 5.5 11ZM8 11.5C8 11.225 8.225 11 8.5 11H9.5C9.775 11 10 11.225 10 11.5V12.5C10 12.775 9.775 13 9.5 13H8.5C8.225 13 8 12.775 8 12.5V11.5ZM2.5 7H3.5C3.775 7 4 7.225 4 7.5V8.5C4 8.775 3.775 9 3.5 9H2.5C2.225 9 2 8.775 2 8.5V7.5C2 7.225 2.225 7 2.5 7ZM5 7.5C5 7.225 5.225 7 5.5 7H6.5C6.775 7 7 7.225 7 7.5V8.5C7 8.775 6.775 9 6.5 9H5.5C5.225 9 5 8.775 5 8.5V7.5ZM8.5 7H9.5C9.775 7 10 7.225 10 7.5V8.5C10 8.775 9.775 9 9.5 9H8.5C8.225 9 8 8.775 8 8.5V7.5C8 7.225 8.225 7 8.5 7Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_222_364">
          <path d="M0 4H12V20H0V4Z" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default BuildingIcon;
