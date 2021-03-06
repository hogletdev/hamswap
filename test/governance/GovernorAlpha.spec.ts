import chai, { expect } from 'chai'
import { Contract, constants } from 'ethers'
import { solidity, MockProvider, createFixtureLoader } from 'ethereum-waffle'

import { governanceFixture } from '../shared/fixtures'
import { DELAY } from '../utils'

chai.use(solidity)

describe('GovernorAlpha', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999,
    },
  })
  const [wallet] = provider.getWallets()
  const loadFixture = createFixtureLoader([wallet], provider)

  let hog: Contract
  let timelock: Contract
  let governorAlpha: Contract
  beforeEach(async () => {
    const fixture = await loadFixture(governanceFixture)
    hog = fixture.hog
    timelock = fixture.timelock
    governorAlpha = fixture.governorAlpha

    await hog.transferOwnership(timelock.address)
    await timelock.setPendingAdmin(governorAlpha.address)
    await governorAlpha.__acceptAdmin();
  })

  it('gov:hog', async () => {
    expect(await hog.owner()).to.be.eq(timelock.address)
    expect(await timelock.admin()).to.be.eq(governorAlpha.address)
    expect(await timelock.pendingAdmin()).to.be.eq(constants.AddressZero)
    expect(await governorAlpha.hog()).to.be.eq(hog.address)
    expect(await governorAlpha.timelock()).to.be.eq(timelock.address)
    expect(await governorAlpha.guardian()).to.be.eq(wallet.address)

    const balance = await hog.balanceOf(wallet.address)
    const totalSupply = await hog.totalSupply()
    expect(balance).to.be.eq(totalSupply)
  })

  it('gov:timelock', async () => {
    expect(await timelock.admin()).to.be.eq(governorAlpha.address)
    expect(await timelock.pendingAdmin()).to.be.eq(constants.AddressZero)
    expect(await timelock.delay()).to.be.eq(DELAY)
  })

  it('gov:governor', async () => {
    expect(await governorAlpha.votingPeriod()).to.be.eq(17280)
    expect(await governorAlpha.timelock()).to.be.eq(timelock.address)
    expect(await governorAlpha.hog()).to.be.eq(hog.address)
  })
})