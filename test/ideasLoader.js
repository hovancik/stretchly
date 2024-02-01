const chai = require('chai')
const IdeasLoader = require('../app/utils/ideasLoader')
const Shuffled = require('../app/utils/shuffled')

chai.should()

describe('ideasLoader', function () {
  const ideas = new IdeasLoader([
    { data: 'a', enabled: true },
    { data: 'b', enabled: false },
    { data: 'c', enabled: true }
  ])

  it('returns enabled ideas', () => {
    const enabled = new Shuffled(['a', 'c'])
    ideas.ideas().should.be.deep.equal(enabled)
  })
})
