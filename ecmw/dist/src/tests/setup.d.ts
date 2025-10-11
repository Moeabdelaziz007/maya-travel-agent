/**
 * Jest test setup for E-CMW
 */
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidWorkflowResult(): R;
        }
    }
    const testUtils: typeof global.testUtils;
}
export {};
//# sourceMappingURL=setup.d.ts.map