import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { accountExceptions, connection } from "./data";
import {
  AccountLayout,
  createCloseAccountInstruction,
} from "@solana/spl-token";

export async function create_close_instruction(
  account: PublicKey,
  token_program: PublicKey,
): Promise<TransactionInstruction[]> {
  const instructions = [];

  const ata_accounts = await connection.getTokenAccountsByOwner(
    account,
    { programId: token_program },
    "confirmed",
  );

  const tokens = ata_accounts.value;
  const size = tokens.length > 25 ? 24 : tokens.length;

  for (let i = 0; i < size; i++) {
    const token_data = AccountLayout.decode(tokens[i].account.data);
    if (
      token_data.amount === BigInt(0) &&
      !accountExceptions.includes(token_data.mint.toString())
    ) {
      const closeInstruction = createCloseAccountInstruction(
        ata_accounts.value[i].pubkey,
        account,
        account,
        [],
        token_program,
      );

      instructions.push(closeInstruction);
    }
  }

  return instructions;
}
