// netlify/functions/mint-patron.js
const { ethers } = require("ethers");

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { address, usdAmount, checkout } = body || {};
    const paymentTxId = checkout?.id;

    const RPC_URL = process.env.RPC_URL;
    const TOKEN_ADDRESS = process.env.PATRON_TOKEN_ADDRESS;
    const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
    const DECIMALS = Number(process.env.PATRON_DECIMALS || "18");
    const PATRON_PER_USD = Number(process.env.PATRON_PER_USD || "1");

    if (!address || !ethers.isAddress(address)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid address" }),
      };
    }

    const usdNum = Number(usdAmount);
    if (!usdNum || usdNum <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid usdAmount" }),
      };
    }

    if (!RPC_URL || !TOKEN_ADDRESS || !TREASURY_PRIVATE_KEY) {
      console.error("Missing env vars", {
        RPC_URL: !!RPC_URL,
        TOKEN_ADDRESS: !!TOKEN_ADDRESS,
        TREASURY_PRIVATE_KEY: !!TREASURY_PRIVATE_KEY,
      });
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server misconfigured" }),
      };
    }

    const patronAmount = usdNum * PATRON_PER_USD; // 1 USD = 1 PATRON
    const amountWei = ethers.parseUnits(String(patronAmount), DECIMALS);

    console.log(
      "Attempting PATRON transfer",
      JSON.stringify({
        to: address,
        usdAmount: usdNum,
        patronAmount,
        amountWei: amountWei.toString(),
        paymentTxId,
      })
    );

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
    const patron = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);

    const tx = await patron.transfer(address, amountWei);
    console.log("PATRON transfer tx sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("PATRON transfer confirmed:", receipt.transactionHash);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        to: address,
        usdAmount,
        patronAmount,
        mintedAmountHuman: `${patronAmount} PATRON`,
        txHash: receipt.transactionHash,
      }),
    };
  } catch (err) {
    console.error("Mint/transfer error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Mint/transfer failed",
        message: err?.message || String(err),
      }),
    };
  }
};