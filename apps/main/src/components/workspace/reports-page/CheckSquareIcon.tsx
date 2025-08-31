import React from "react";
import type { CheckSquareIconProps } from '../../../types/interfaces/ui';

const CheckSquareIcon: React.FC<CheckSquareIconProps> = ({ size = 24, className, ...props }) => {
  // Maintain original aspect ratio width:height = 60:61
  const width = size * (60 / 61);
  const filterId = React.useId();

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 60 61"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g filter={`url(#${filterId})`}>
        <path/>
        <path d="M22.5 23C22.5 22.3086 21.9414 21.75 21.25 21.75C20.5586 21.75 20 22.3086 20 23V36.125C20 37.8516 21.3984 39.25 23.125 39.25H38.75C39.4414 39.25 40 38.6914 40 38C40 37.3086 39.4414 36.75 38.75 36.75H23.125C22.7812 36.75 22.5 36.4688 22.5 36.125V23ZM38.3828 26.3828C38.8711 25.8945 38.8711 25.1016 38.3828 24.6133C37.8945 24.125 37.1016 24.125 36.6133 24.6133L32.5 28.7305L30.2578 26.4883C29.7695 26 28.9766 26 28.4883 26.4883L24.1133 30.8633C23.625 31.3516 23.625 32.1445 24.1133 32.6328C24.6016 33.1211 25.3945 33.1211 25.8828 32.6328L29.375 29.1445L31.6172 31.3867C32.1055 31.875 32.8984 31.875 33.3867 31.3867L38.3867 26.3867L38.3828 26.3828Z" fill="currentColor" />
      </g>
      <defs>
        <filter id={filterId} x="0" y="-3" width="60" height="68" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset />
          <feGaussianBlur stdDeviation="10" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.921569 0 0 0 0 0.796078 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_120_2665" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_120_2665" result="shape" />
        </filter>
      </defs>
    </svg>
  );
};

export default CheckSquareIcon;
