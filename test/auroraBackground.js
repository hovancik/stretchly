import 'chai/register-should'
import auroraBackground from '../app/utils/auroraBackground'

describe('auroraBackground', function () {
  it('returns a layered CSS background built from the given colour', () => {
    const result = auroraBackground('#633738')
    result.should.be.a('string')
    result.should.contain('radial-gradient')
    result.should.contain('linear-gradient')
    // the configured colour is kept as the middle stop
    result.should.contain('#633738')
  })

  it('accepts a colour without the leading hash', () => {
    auroraBackground('633738').should.contain('#633738')
  })

  it('falls back to a neutral colour for invalid input', () => {
    auroraBackground('not-a-colour').should.contain('#203a43')
    auroraBackground(undefined).should.contain('#203a43')
  })

  it('derives a darker and a lighter stop from the base colour', () => {
    const result = auroraBackground('#478484')
    result.should.contain('#203b3b') // darkened
    result.should.contain('#7ea9a9') // lightened
  })
})
