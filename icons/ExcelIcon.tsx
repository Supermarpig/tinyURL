export const ExcelIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
                        stroke-width: 2.7px;
                    }
                `}
            </style>
        </defs>
        <path className="cls-1" d="M35,9v15h14" />
        <path className="cls-1" d="M15,9h22l12,12v34H15V9Z" />
        <path className="cls-2" d="M37.5,33h-11.5v13h11.5" />
        <path className="cls-2" d="M27,39.5h10.5" />
    </svg>
);
