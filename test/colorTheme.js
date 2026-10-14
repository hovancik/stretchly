import { colorThemes, randomTheme, resolveColor } from '../app/utils/colorTheme'
import 'chai/register-should'

describe('colorTheme', function () {
  describe('resolveColor', function () {
    it('returns fixed colors unchanged', function () {
      resolveColor('#478484').should.equal('#478484')
      resolveColor('#ffffff').should.equal('#ffffff')
      resolveColor('#123456').should.equal('#123456')
    })

    it('picks a color from the theme list for the random theme', function () {
      for (let i = 0; i < 500; i++) {
        colorThemes.should.include(resolveColor(randomTheme))
      }
    })

    it('is deterministic for a given random source', function () {
      resolveColor(randomTheme, () => 0).should.equal(colorThemes[0])
      resolveColor(randomTheme, () => 0.999999).should.equal(colorThemes[colorThemes.length - 1])
    })

    it('can reach every theme color', function () {
      const picked = new Set()
      for (let i = 0; i < colorThemes.length; i++) {
        picked.add(resolveColor(randomTheme, () => i / colorThemes.length))
      }
      picked.size.should.equal(colorThemes.length)
    })

    it('passes through a missing settings value', function () {
      (resolveColor(undefined) === undefined).should.equal(true)
    })
  })
})
