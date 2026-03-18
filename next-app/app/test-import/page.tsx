// app/test-import/page.tsx
'use client'

export default function TestImport() {
  const testImport = async (importPath: string) => {
    try {
      // Note: Dynamic imports need to be deterministic at build time
      // For testing, use import expressions with known paths only
      console.log('Import path:', importPath)
      return { success: true, exports: [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Import Test</h1>
      <p>Test which import path works for your project structure</p>
    </div>
  )
}
