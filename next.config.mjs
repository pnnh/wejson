import bundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production'

// Codespaces 环境检测与 WebSocket 配置
const isCodespaces = process.env.CODESPACES === 'true';
const getWebSocketHost = () => {
    if (isCodespaces) {
        // Codespaces 环境：使用 codespace 域名
        const codspaceName = process.env.CODESPACE_NAME;
        const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'github.dev';
        return `${codspaceName}.${domain}`;
    }
    // 本地开发环境使用 localhost
    return 'localhost';
};

const getWebSocketProtocol = () => {
    // Codespaces 总是使用 wss://，本地开发使用 ws://
    return isCodespaces ? 'wss' : 'ws';
};

/** @type {import('next').NextConfig} */
let nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
    productionBrowserSourceMaps: true,
    enablePrerenderSourceMaps: true,
    experimental: {
        esmExternals: true,
        serverSourceMaps: true,
    },
    images: {
        remotePatterns: [
            {
                hostname: 'localhost'
            },
            {
                hostname: '127.0.0.1'
            },
        ]
    },
    compress: isProd,    // 构建时会压缩
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
        silenceDeprecations: ['legacy-js-api'],
    },
    compiler: {
        removeConsole: {
            exclude: ['error', 'warn', 'log']
        },
    },
    devServer: {
        // WebSocket HMR 配置：自适应 Codespaces 和本地开发环境
        client: {
            protocol: getWebSocketProtocol(),
            host: getWebSocketHost(),
        },
    },
}
const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: false,
})

export default withBundleAnalyzer(nextConfig);
