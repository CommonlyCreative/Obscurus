import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.steamstatic.com',
                port: '',
                pathname: '/**',
            },
        ]
    },
    // serverExternalPackages: ['@deadlock-api/ui-core', '@deadlock-api/ui-react'],
    transpilePackages: ['@deadlock-api/ui-core', '@deadlock-api/ui-react'],
    cacheComponents: true,
};

export default nextConfig;
