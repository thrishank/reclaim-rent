import { Connection } from "@solana/web3.js";
// import {clusterApiUrl} from "@solana/web3.js"
// export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const api_key = process.env.API_KEY;

export const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${api_key}`,
  "confirmed"
);

export const accountExceptions = [
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
];
