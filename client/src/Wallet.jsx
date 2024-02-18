import * as secp from 'ethereum-cryptography/secp256k1'
import { toHex } from 'ethereum-cryptography/utils'

import server from "./server"

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKeyValue = evt.target.value

    setPrivateKey(privateKeyValue)

    const address = secp.secp256k1.getPublicKey(privateKeyValue)

    setAddress(toHex(address))

    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`)
      setBalance(balance)
    } else {
      setBalance(0)
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type a private key" value={privateKey} onChange={onChange}></input>
      </label>

      <label>
        Address
        <input value={address} readOnly={true} />
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  )
}

export default Wallet
