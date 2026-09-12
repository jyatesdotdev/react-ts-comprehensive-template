import { describe, it, expect } from 'vitest'
import { POC_CONFIG } from './config/pocs'
import pocsSource from './config/pocs.ts?raw'
import screenshotsSource from '../e2e/screenshots.spec.ts?raw'

const pocPageModules = import.meta.glob('./pages/pocs/*.tsx')

const screenshotPaths = (): string[] => {
  const block = screenshotsSource.match(/const POC_PATHS = \[([\s\S]*?)\]/)
  if (!block) throw new Error('POC_PATHS array not found in e2e/screenshots.spec.ts')
  return [...block[1].matchAll(/'([^']+)'/g)].map(match => match[1])
}

describe('POC registry completeness', () => {
  const pageFiles = Object.keys(pocPageModules).map(file =>
    file.replace('./pages/pocs/', '').replace(/\.tsx$/, '')
  )
  const configPaths = POC_CONFIG.map(poc => poc.path).sort()
  const pocPaths = screenshotPaths()
  const screenshotPocPaths = pocPaths.filter(path => path !== '/').sort()

  it('has a lazy import for every src/pages/pocs/*.tsx page', () => {
    expect(pageFiles.length).toBeGreaterThan(0)
    expect(POC_CONFIG).toHaveLength(pageFiles.length)

    for (const base of pageFiles) {
      expect(pocsSource, `${base}.tsx should have a React.lazy import`).toContain(
        `import('../pages/pocs/${base}')`
      )
    }
  })

  it('keeps POC_PATHS in sync with POC_CONFIG (plus Home /)', () => {
    expect(pocPaths).toContain('/')
    expect(screenshotPocPaths).toEqual(configPaths)
  })
})
