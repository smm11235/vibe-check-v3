import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

// Build version: package version + git short hash
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
const appVersion = `v${pkg.version}-${gitHash}`;

export default defineConfig({
	plugins: [
		tailwindcss(),
		react(),
	],
	base: '/vibe-check-v3/',
	define: {
		__APP_VERSION__: JSON.stringify(appVersion),
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
	server: {
		port: 5173,
	},
});
