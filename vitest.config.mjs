import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: [
            // Mirrors webpack's context module resolution for the dynamic Font Awesome import, see FontAwesomeIcon.js.
            {
                find: /^(@fortawesome\/free-[a-z]+-svg-icons\/fa[A-Za-z0-9]+)\.js$/,
                replacement: '$1',
            },
        ],
    },
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
