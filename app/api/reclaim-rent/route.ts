import {
  ActionError,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { create_close_instruction } from "./close";
import { connection } from "./data";

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
// 1. learn about compute units limit and other limits
// 2. Find the total number of accounts that can be closed in a single transaction while ensuring the transaction succeeds
// 3. Add analytics -> total sol reclaimed, total ata accounts closed, total owner accounts participated

export async function POST(req: Request) {
  try {
    const body: ActionPostRequest = await req.json();
    const account = new PublicKey(body.account);

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const tx = new Transaction({
      feePayer: account,
      blockhash,
      lastValidBlockHeight,
    });

    // 49 - 1882 byts
    // 29 - 1336 byts
    // 27 - 1258 byts

    const spl_token = await create_close_instruction(account, TOKEN_PROGRAM_ID);
    const token_2022 = await create_close_instruction(
      account,
      TOKEN_2022_PROGRAM_ID
    );

    spl_token.forEach((instruction) => tx.add(instruction));
    token_2022.forEach((instruction) => tx.add(instruction));

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction: tx,
      },
    });

    return Response.json(payload, { headers });
  } catch (err) {
    console.log(err);
    const message = "Some error occured";
    return Response.json({ message } as ActionError, {
      status: 403,
      headers,
    });
  }
}
