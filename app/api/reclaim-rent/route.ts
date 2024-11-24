import {
  ActionError,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import {
  AccountLayout,
  createCloseAccountInstruction,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  transfer,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const headers = createActionHeaders();
export async function GET(req: Request) {
  const url = new URL(req.url);
  const img_url = new URL("/rent.jpg", url.origin).toString();

  const payload: ActionGetResponse = {
    type: "action",
    title: "Reclaim Rent",
    description: "Reclaim your rent by closing unwanted token accounts",
    icon: img_url,
    label: "hello",
    links: {
      actions: [
        {
          label: "claim rent",
          href: "/api/reclaim-rent",
          type: "post",
        },
      ],
    },
  };

  return Response.json(payload, { headers });
}

export async function OPTIONS() {
  return new Response(null, { headers });
}

// Things to do
// 1. Transaction compute units limit
// 2. Find the total number of accounts that can be closed while ensuring the transaction succeeds

export async function POST(req: Request) {
  try {
    const body: ActionPostRequest = await req.json();
    const account = new PublicKey(body.account);

    const connection = new Connection(clusterApiUrl("devnet"), "finalized");
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const tx = new Transaction({
      feePayer: account,
      blockhash,
      lastValidBlockHeight,
    });

    const imp_token_mint = [
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
    ];
    const ata_accounts = await connection.getTokenAccountsByOwner(
      account,
      { programId: TOKEN_PROGRAM_ID },
      "finalized",
    );

    // 49 - 1882 byts
    // 29 - 1336 byts
    // 27 - 1258 byts

    const keys = ata_accounts.value;
    for (let i = 0; i < 27; i++) {
      const token_data = AccountLayout.decode(keys[i].account.data);
      if (
        token_data.amount === BigInt(0) &&
        !imp_token_mint.includes(token_data.mint.toString())
      ) {
        const closeInstruction = createCloseAccountInstruction(
          ata_accounts.value[i].pubkey,
          account,
          account,
        );
        tx.add(closeInstruction);
      }
    }

    const ata_accounts_token_2022 = await connection.getTokenAccountsByOwner(
      account,
      { programId: TOKEN_2022_PROGRAM_ID },
      "finalized",
    );

    for (let i = 0; i < ata_accounts_token_2022.value.length; i++) {
      const token_data = AccountLayout.decode(
        ata_accounts_token_2022.value[i].account.data,
      );
      if (
        token_data.amount === BigInt(0) &&
        !imp_token_mint.includes(token_data.mint.toString())
      ) {
        const closeInstruction = createCloseAccountInstruction(
          ata_accounts_token_2022.value[i].pubkey,
          account,
          account,
          [],
          TOKEN_2022_PROGRAM_ID,
        );
        // console.log(closeInstruction);
        tx.add(closeInstruction);
      }
      // console.log(token_data);
    }

    console.log(tx);
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction: tx,
      },
    });

    return Response.json(payload, { headers });
  } catch (err) {
    console.log(err);
    let message = "Some error occured";
    return Response.json({ message } as ActionError, {
      status: 403,
      headers,
    });
  }
}
