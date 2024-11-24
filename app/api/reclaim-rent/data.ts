import { clusterApiUrl, Connection } from "@solana/web3.js";

// export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
export const connection = new Connection(
  clusterApiUrl("mainnet-beta"),
  "confirmed",
);

export const accountExceptions = [
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
];
