const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  transfer,
  mintTo,
} = require("@solana/spl-token");
const { PublicKey } = require("@solana/web3.js");
const { Connection, clusterApiUrl } = require("@solana/web3.js");
const { Keypair } = require("@solana/web3.js");

const fs = require("fs");

const kp = Keypair.fromSecretKey(
  new Uint8Array(
    JSON.parse(fs.readFileSync("/Users/thris/.config/solana/id.json", "utf-8")),
  ),
);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function create_token() {
  const mint = await createMint(connection, kp, kp.publicKey, null, 6);
  console.log("Token created", mint.toString());

  const to_pub_key = new PublicKey(
    "DoQ47WTYzvgCNXwVK1Uf3urpXqa8maE7hJFd1xNLYUp2",
  );

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    kp,
    mint,
    to_pub_key,
  );
  console.log("Ata created", ata.address.toString());
}

for (let i = 0; i < 26; i++) {
  setTimeout(() => {
    console.log(`Creating token number ${i}`);
    create_token();
    console.log("waiting", i * 4, "seconds");
  }, i * 4000);
}
