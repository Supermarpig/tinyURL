export const WordIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" {...props}>
        <defs>
            <style>
                {`
                    .cls-1 {
                        stroke-width: 3px;
                    }
                    .cls-1, .cls-2 {
                        fill: none;
                        stroke: #3c3a3a;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }
                    .cls-2 {
                        stroke-width: 2.6px;
                    }
                `}
            </style>
        </defs>
        <path className="cls-1" d="M35,9v15h14" />
        <path className="cls-1" d="M15,9h22l12,12v34H15V9Z" />
        <path className="cls-2" d="M24,34l3,12h1.5l3-12h1l3,12h1.5l3-12" />
    </svg>
);