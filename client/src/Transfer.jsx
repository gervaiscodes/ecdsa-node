import { useState } from 'react'
import * as secp from 'ethereum-cryptography/secp256k1'
import { keccak256 } from 'ethereum-cryptography/keccak'
import { toHex, utf8ToBytes } from 'ethereum-cryptography/utils'
import server from "./server"

function hashMessage(message) {
  const utf8 = utf8ToBytes(message)
  return keccak256(utf8)
}

function Transfer({ privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("")
  const [recipient, setRecipient] = useState("")

  const setValue = (setter) => (evt) => setter(evt.target.value)

  async function transfer(evt) {
    evt.preventDefault()

    const message = { amount: parseInt(sendAmount), recipient }
    const messageHash = hashMessage(JSON.stringify(message))
    const signature = secp.secp256k1.sign(messageHash, privateKey).toCompactHex()

    try {
      const {
        data: { balance },
      } = await server.post(`send`, { ...message, signature })
      setBalance(balance);
    } catch (ex) {
      console.error(ex)
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  )
}

export default Transfer
