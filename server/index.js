const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require('ethereum-cryptography/secp256k1')
const { keccak256 } = require('ethereum-cryptography/keccak')
const { utf8ToBytes, toHex } = require('ethereum-cryptography/utils')
const { bufferToHex } = require('ethereumjs-util')

app.use(cors());
app.use(express.json());

const balances = {
  "03e1d93001714189f718cf912818f9e320b80f295567c20b3ddf59eec3c8ae9ca2": 100,
  "0327babc2be1f309a4d2d0333c190c36e4368b07578e19e0c5172aa958dfbc909d": 50
};

function hashMessage(message) {
  const utf8 = utf8ToBytes(message)
  return keccak256(utf8)
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { recipient, amount, signature } = req.body

  const message = { amount, recipient }

  // We compute a hash of the message
  const messageHash = hashMessage(JSON.stringify(message))

  // We build the signature sent from the client
  let sig = secp.secp256k1.Signature.fromCompact(signature)
  sig = sig.addRecoveryBit(0)

  // We recover the public key from the signature
  const publicKey = sig.recoverPublicKey(messageHash)

  // We convert the public key to an address
  const sender = toHex(publicKey.toRawBytes())

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: `Not enough funds!` });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
