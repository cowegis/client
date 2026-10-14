import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        setupFiles: ['./test/setup.js'],
        css: false,
        unstubGlobals: true,
        restoreMocks: true,
        coverage: {
            provider: 'v8',
            include: ['js/**/*.js'],
            reporter: ['text', 'html', 'lcov'],
        },
    },
});
