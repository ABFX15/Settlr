import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: [
        'react',
        '@solana/wallet-adapter-react',
        '@solana/wallet-adapter-base',
    ],
    esbuildOptions(options) {
        options.jsx = 'automatic';
    },
});
