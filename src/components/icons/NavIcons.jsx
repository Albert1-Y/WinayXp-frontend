import React from "react";

const baseIconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const SvgIcon = ({ children }) => <svg {...baseIconProps}>{children}</svg>;

export const DashboardIcon = () => (
  <SvgIcon>
    <rect x="3" y="3" width="8" height="9" rx="1.6" />
    <rect x="13" y="3" width="8" height="5" rx="1.6" />
    <rect x="13" y="10" width="8" height="9" rx="1.6" />
    <rect x="3" y="14" width="8" height="5" rx="1.6" />
  </SvgIcon>
);

export const UsersIcon = () => (
  <SvgIcon>
    <circle cx="8" cy="8" r="3" />
    <circle cx="17" cy="10" r="2.5" />
    <path d="M3 21v-1.5A4.5 4.5 0 0 1 7.5 15H8a4.5 4.5 0 0 1 4.5 4.5V21" />
    <path d="M13.5 21V19a3.5 3.5 0 0 1 3.5-3.5H18a3 3 0 0 1 3 3V21" />
  </SvgIcon>
);

export const UserPlusIcon = () => (
  <SvgIcon>
    <circle cx="10" cy="8" r="3" />
    <path d="M4 21v-1.5A5.5 5.5 0 0 1 9.5 14H10a5.5 5.5 0 0 1 5.5 5.5V21" />
    <path d="M18 7v6" />
    <path d="M15 10h6" />
  </SvgIcon>
);

export const GraduationCapIcon = () => (
  <SvgIcon>
    <path d="m3 8 9-4 9 4-9 4-9-4Z" />
    <path d="M6 10v5.5a6 6 0 0 0 12 0V10" />
    <path d="M21 8v5" />
  </SvgIcon>
);

export const GraduationCapPlusIcon = () => (
  <SvgIcon>
    <path d="m3 8 9-4 9 4-9 4-9-4Z" />
    <path d="M6 10v5.5a6 6 0 0 0 12 0V10" />
    <path d="M5 4v4" />
    <path d="M3 6h4" />
  </SvgIcon>
);

export const CalendarIcon = () => (
  <SvgIcon>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M3 10h18" />
    <path d="M8 14h2" />
    <path d="M12 14h2" />
    <path d="M16 14h2" />
  </SvgIcon>
);

export const CalendarPlusIcon = () => (
  <SvgIcon>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M3 10h18" />
    <path d="M12 15v4" />
    <path d="M10 17h4" />
  </SvgIcon>
);

export const AttendanceIcon = () => (
  <SvgIcon>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 7h8" />
    <path d="M8 11h4" />
    <path d="M8 15h6" />
    <path d="m14 11 2 2 3-3" />
  </SvgIcon>
);

export const CreditIcon = () => (
  <SvgIcon>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v10" />
    <path d="M9 10h5.5a2.5 2.5 0 0 1 0 5H9" />
  </SvgIcon>
);

export const ProfileIcon = () => (
  <SvgIcon>
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 20v-1.5A6.5 6.5 0 0 1 11.5 12h1A6.5 6.5 0 0 1 19 18.5V20" />
  </SvgIcon>
);

export const TrophyIcon = () => (
  <SvgIcon>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v6a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z" />
    <path d="M4 6h3v2a4 4 0 0 1-4-4V4h1a2 2 0 0 1 2 2Zm16-2v1a4 4 0 0 1-4 4V6h3a2 2 0 0 0 2-2V4h-1Z" />
  </SvgIcon>
);

export const LevelsIcon = () => (
  <SvgIcon>
    <path d="M4 18h6v3H4z" />
    <path d="M10 13h6v8h-6z" />
    <path d="M16 8h6v13h-6z" />
    <path d="M4 13h6" />
    <path d="M10 8h6" />
  </SvgIcon>
);
