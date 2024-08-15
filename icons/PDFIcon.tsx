export const PDFIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" {...props}>
        <defs>
            <style>
                {`
                    .cls-1 { fill: none; stroke: #3c3a3a; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3px; }
                    .cls-2 { fill: #3c3a3a; }
                `}
            </style>
        </defs>
        <path className="cls-2" d="M32.46,36.27l.02-.08c.31-1.33.71-3,.4-4.5-.21-1.19-1.05-1.65-1.78-1.69-.85-.04-1.61.46-1.8,1.19-.36,1.34-.04,3.17.55,5.5-.73,1.81-1.91,4.44-2.76,6-1.6.85-3.74,2.17-4.06,3.83-.06.31.01.7.19,1.05.2.39.52.69.89.84.16.06.36.11.58.11.95,0,2.49-.79,4.54-4.43.31-.11.64-.22.95-.33,1.47-.51,2.99-1.05,4.37-1.29,1.52.84,3.25,1.38,4.43,1.38s1.62-.71,1.8-1.14c.3-.75.16-1.7-.33-2.21-.71-.73-2.45-.92-5.14-.57-1.33-.84-2.2-1.98-2.83-3.67Z" />
        <path className="cls-1" d="M35,9v15h14" />
        <path className="cls-1" d="M15,9h22l12,12v34H15V9Z" />
    </svg>
);
