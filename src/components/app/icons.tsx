import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.92 3.33C13.2975 3.11195 12.6515 3.00061 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.5425 21 20.3753 17.6166 20.9167 13.1667C18.6667 14.3333 16 13.5 15.5 11.5C15 9.5 16.5 7.5 18.5 6.83333C17.3888 4.79973 15.78 3.82 13.92 3.33Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5L19.25 4.75L21.5 5.5L19.25 6.25L18.5 8.5L17.75 6.25L15.5 5.5L17.75 4.75L18.5 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
