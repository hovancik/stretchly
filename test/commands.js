import 'chai/register-should'
import Command from '../app/utils/commands'

describe('commands', () => {
  it('should parse a valid simple command', () => {
    const input = ['help']
    const cmd = new Command(input, '1.2.3')
    cmd.command.should.be.equal('help')
  })

  it('should return help when there is no commmand', () => {
    const input = []
    const cmd = new Command(input, '1.2.3')
    cmd.command.should.be.equal('help')
  })

  it('should parse a more complex command', () => {
    const input = ['pause', '-d', 'until-morning']
    const cmd = new Command(input, '1.2.3')
    cmd.command.should.be.equal('pause')
    cmd.options.duration.should.be.equal('until-morning')
  })

  it('should drop all flags before the command', () => {
    const input = ['--some-electron-flag=value', 'mini', '-T', 'test', '--noskip']
    const cmd = new Command(input, '1.2.3')
    cmd.command.should.be.equal('mini')
    cmd.options.title.should.be.equal('test')
  })

  it('should get options from a command', () => {
    const cmd = new Command(['mini', '-T', 'test', '-n'], '1.2.3')
    cmd.options.title.should.be.equal('test')
    cmd.options.noskip.should.be.equal(true)
  })

  it('includes only the specified options in the resulting options object', () => {
    const cmd = new Command(['mini', '-T', 'test'], '1.2.3')
    cmd.options.should.deep.equal({ title: 'test' })
  })

  it('hasSupportedCommand is false with an invalid command', () => {
    const cmd = new Command(['foo'], '1.2.3')
    cmd.hasSupportedCommand.should.be.equal(false)
  })

  it('hasSupportedCommand is true with an invalid command', () => {
    const cmd = new Command(['mini'], '1.2.3')
    cmd.hasSupportedCommand.should.be.equal(true)
  })

  it('parses a number duration as the number of minutes to pause', () => {
    const input = ['pause', '-d', '60']
    const cmd = new Command(input, '1.2.3')
    cmd.durationToMs(null).should.be.equal(60 * 60 * 1000)
  })

  it('parses a duration argument with hours and minutes', () => {
    const input = ['pause', '-d', '4h39m']
    const cmd = new Command(input, '1.2.3')
    cmd.durationToMs(null).should.be.equal(4 * 60 * 60 * 1000 + 39 * 60 * 1000)
  })

  it('parses a duration argument with hours and minutes in the upper case', () => {
    const input = ['pause', '-d', '4H39M']
    const cmd = new Command(input, '1.2.3')
    cmd.durationToMs(null).should.be.equal(4 * 60 * 60 * 1000 + 39 * 60 * 1000)
  })

  it('parses a duration argument with just the minutes', () => {
    const input = ['pause', '-d', '60m']
    const cmd = new Command(input, '1.2.3')
    cmd.durationToMs(null).should.be.equal(60 * 60 * 1000)
  })

  it('parses a duration argument with just the hours', () => {
    const input = ['pause', '-d', '184h']
    const cmd = new Command(input, '1.2.3')
    cmd.durationToMs(null).should.be.equal(184 * 60 * 60 * 1000)
  })

  it('returns -1 if there\'s extra text in the duration argument', () => {
    new Command(['pause', '-d', 'foo4h39mbar'], '1.2.3').durationToMs(null).should.be.equal(-1)
    new Command(['pause', '-d', 'foo4h39m'], '1.2.3').durationToMs(null).should.be.equal(-1)
    new Command(['pause', '-d', '4h39mbar'], '1.2.3').durationToMs(null).should.be.equal(-1)
  })

  it('returns -1 if a number duration argument is zero', () => {
    const input = ['pause', '-d', '0']
    const cmd = new Command(input, '1.2.3')
    cmd.durationToMs(null).should.be.equal(-1)
  })

  it('returns -1 if the duration argument with the hours and minutes evaluates to zero', () => {
    const input = ['pause', '-d', '0h0m']
    const cmd = new Command(input, '1.2.3')
    cmd.durationToMs(null).should.be.equal(-1)
  })

  it('returns -1 if the duration argument with just the minutes evaluates to zero', () => {
    const input = ['pause', '-d', '0m']
    const cmd = new Command(input, '1.2.3')
    cmd.durationToMs(null).should.be.equal(-1)
  })

  it('returns -1 if the duration argument with just the hours evaluates to zero', () => {
    const input = ['pause', '-d', '0h']
    const cmd = new Command(input, '1.2.3')
    cmd.durationToMs(null).should.be.equal(-1)
  })

  it('should return -1 if the duration argument is not in a known format', () => {
    const input = ['pause', '-d', '10i20k']
    const cmd = new Command(input, '1.2.3')
    cmd.durationToMs(null).should.be.equal(-1)
  })

  it('parses a number scheduler as the number of minutes to break', () => {
    const input = ['long', '-w', '60']
    const cmd = new Command(input, '1.2.3')
    cmd.waitToMs(null).should.be.equal(60 * 60 * 1000)
  })

  it('parses a scheduler argument with hours and minutes', () => {
    const input = ['long', '-w', '4h39m']
    const cmd = new Command(input, '1.2.3')
    cmd.waitToMs(null).should.be.equal(4 * 60 * 60 * 1000 + 39 * 60 * 1000)
  })

  it('parses a scheduler argument with hours and minutes in the upper case', () => {
    const input = ['long', '-w', '4H39M']
    const cmd = new Command(input, '1.2.3')
    cmd.waitToMs(null).should.be.equal(4 * 60 * 60 * 1000 + 39 * 60 * 1000)
  })

  it('parses a scheduler argument with just the minutes', () => {
    const input = ['long', '-w', '60m']
    const cmd = new Command(input, '1.2.3')
    cmd.waitToMs(null).should.be.equal(60 * 60 * 1000)
  })

  it('parses a scheduler argument with just the hours', () => {
    const input = ['long', '-w', '184h']
    const cmd = new Command(input, '1.2.3')
    cmd.waitToMs(null).should.be.equal(184 * 60 * 60 * 1000)
  })

  it('returns -1 if there\'s extra text in the scheduler argument', () => {
    new Command(['long', '-w', 'foo4h39mbar'], '1.2.3').waitToMs(null).should.be.equal(-1)
    new Command(['long', '-w', 'foo4h39m'], '1.2.3').waitToMs(null).should.be.equal(-1)
    new Command(['long', '-w', '4h39mbar'], '1.2.3').waitToMs(null).should.be.equal(-1)
  })

  it('returns -1 if a number scheduler argument is zero', () => {
    const input = ['long', '-w', '0']
    const cmd = new Command(input, '1.2.3')
    cmd.waitToMs(null).should.be.equal(-1)
  })

  it('returns -1 if the scheduler argument with the hours and minutes evaluates to zero', () => {
    const input = ['long', '-w', '0h0m']
    const cmd = new Command(input, '1.2.3')
    cmd.waitToMs(null).should.be.equal(-1)
  })

  it('returns -1 if the scheduler argument with just the minutes evaluates to zero', () => {
    const input = ['long', '-w', '0m']
    const cmd = new Command(input, '1.2.3')
    cmd.waitToMs(null).should.be.equal(-1)
  })

  it('returns -1 if the scheduler argument with just the hours evaluates to zero', () => {
    const input = ['long', '-w', '0h']
    const cmd = new Command(input, '1.2.3')
    cmd.waitToMs(null).should.be.equal(-1)
  })

  it('should return -1 if the scheduler argument is not in a known format', () => {
    const input = ['long', '-w', '10i20k']
    const cmd = new Command(input, '1.2.3')
    cmd.waitToMs(null).should.be.equal(-1)
  })
})
