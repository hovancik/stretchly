import 'chai/register-should'
import Shuffled from '../app/utils/shuffled'

describe('shuffled', function () {
  const microbreakIdeas = new Shuffled([1, 2, 3, 4])

  it('returns random elements without repetition', function () {
    let sum = 0
    for (let i = 1; i < 20000; i++) {
      sum += microbreakIdeas.randomElement
      if (i % 4 === 0) {
        sum.should.equal(10)
        sum = 0
      }
    }
  })
})
