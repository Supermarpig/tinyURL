declare module 'useragent' {
    export function parse(userAgentString: string): {
        device: any;
        os: {
            family: string;
            major: string;
            minor: string;
            patch: string;
            toString: () => string;
        };
        toAgent: () => string;
        toString: () => string;
    };
}
