import { dangerColorForTheme } from '../app/utils/breakHealthEffect'
import 'chai/register-should'

describe('dangerColorForTheme', function () {
  it('returns specific color for Green Clouds theme', function () {
    dangerColorForTheme('#478484').should.deep.equal([255, 36, 36, 1.5])
  })

  it('returns pink-red for Autumn Be Blessed theme', function () {
    dangerColorForTheme('#633738').should.deep.equal([255, 50, 80, 1.5])
  })

  it('returns darker red for Snow White theme', function () {
    dangerColorForTheme('#ffffff').should.deep.equal([200, 30, 30, 2.0])
  })

  it('returns lighter red for Graphite Crystal theme', function () {
    dangerColorForTheme('#1D1F21').should.deep.equal([255, 70, 70, 1.0])
  })

  it('returns boosted red for Coffee Kisses theme', function () {
    dangerColorForTheme('#A49898').should.deep.equal([255, 36, 36, 1.5])
  })

  it('returns boosted red for Morning Swim theme', function () {
    dangerColorForTheme('#567890').should.deep.equal([255, 36, 36, 1.4])
  })

  it('returns default red for unknown custom color', function () {
    dangerColorForTheme('#123456').should.deep.equal([255, 36, 36, 1.0])
  })

  it('is case-insensitive', function () {
    dangerColorForTheme('#FFFFFF').should.deep.equal([200, 30, 30, 2.0])
    dangerColorForTheme('#1d1f21').should.deep.equal([255, 70, 70, 1.0])
    dangerColorForTheme('#A49898').should.deep.equal([255, 36, 36, 1.5])
  })

  it('returns default red when themeColor is null or undefined', function () {
    dangerColorForTheme(null).should.deep.equal([255, 36, 36, 1.0])
    dangerColorForTheme(undefined).should.deep.equal([255, 36, 36, 1.0])
  })
})
