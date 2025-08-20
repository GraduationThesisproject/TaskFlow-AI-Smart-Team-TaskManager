import * as React from "react";

export interface SlidersIconProps extends React.SVGProps<SVGSVGElement> {
  // Height in pixels; width auto-scales to 14:16 ratio
  size?: number;
  // Optional explicit color; defaults to currentColor so it can be styled via className
  color?: string;
}

const SlidersIcon: React.FC<SlidersIconProps> = ({ size = 16, color, className, width, height, style, ...props }) => {
  const computedHeight = height ?? size;
  const computedWidth = width ?? Math.round((size * 14) / 16);
  const mergedStyle = color ? { color, ...(style || {}) } : style;

  return (
    <svg
      width={computedWidth}
      height={computedHeight}
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={mergedStyle}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {/* Frame outline */}
      <path />
      {/* Sliders glyph */}
      <path d="M2.94125 9.84688C2.94125 10.6562 2.28 11.3175 1.47063 11.3175C0.66125 11.3175 0 10.6562 0 9.84688C0 9.0375 0.66125 8.37625 1.47063 8.37625H2.94125V9.84688ZM3.6825 9.84688C3.6825 9.0375 4.34375 8.37625 5.15312 8.37625C5.9625 8.37625 6.62375 9.0375 6.62375 9.84688V13.5294C6.62375 14.3387 5.9625 15 5.15312 15C4.34375 15 3.6825 14.3387 3.6825 13.5294V9.84688ZM5.15312 3.94125C4.34375 3.94125 3.6825 3.28 3.6825 2.47062C3.6825 1.66125 4.34375 1 5.15312 1C5.9625 1 6.62375 1.66125 6.62375 2.47062V3.94125H5.15312ZM5.15312 4.6825C5.9625 4.6825 6.62375 5.34375 6.62375 6.15312C6.62375 6.9625 5.9625 7.62375 5.15312 7.62375H1.47063C0.66125 7.62375 0 6.9625 0 6.15312C0 5.34375 0.66125 4.6825 1.47063 4.6825H5.15312ZM11.0588 6.15312C11.0588 5.34375 11.72 4.6825 12.5294 4.6825C13.3387 4.6825 14 5.34375 14 6.15312C14 6.9625 13.3387 7.62375 12.5294 7.62375H11.0588V6.15312ZM10.3175 6.15312C10.3175 6.9625 9.65625 7.62375 8.84688 7.62375C8.0375 7.62375 7.37625 6.9625 7.37625 6.15312V2.47062C7.37625 1.66125 8.0375 1 8.84688 1C9.65625 1 10.3175 1.66125 10.3175 2.47062V6.15312ZM8.84688 12.0588C9.65625 12.0588 10.3175 12.72 10.3175 13.5294C10.3175 14.3387 9.65625 15 8.84688 15C8.0375 15 7.37625 14.3387 7.37625 13.5294V12.0588H8.84688ZM8.84688 11.3175C8.0375 11.3175 7.37625 10.6562 7.37625 9.84688C7.37625 9.0375 8.0375 8.37625 8.84688 8.37625H12.5294C13.3387 8.37625 14 9.0375 14 9.84688C14 10.6562 13.3387 11.3175 12.5294 11.3175H8.84688Z" fill="currentColor"/>
    </svg>
  );
};

export default SlidersIcon;
