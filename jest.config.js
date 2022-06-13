/** @type {import('jest').Config} */
const config = {
    verbose: true,
    testMatch: ["**/__tests__/!(mocks)**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
};

module.exports = config;