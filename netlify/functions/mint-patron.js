// netlify/functions/mint-patron.js
const { ethers } = require("ethers");

// Minimal ERC-20 ABI for transfer-based distribution
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address owner) public view returns (uint256)",
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
    // align with what your frontend actually sends:
    // { address, usdAmount, checkout: { id, amountPaid, currency } }
    const { address, usdAmount, checkout } = body || {};
    const paymentTxHash = checkout?.id;

    const RPC_URL = process.env.RPC_URL;
    const TOKEN_ADDRESS = process.env.PATRON_TOKEN_ADDRESS;
    const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;

    // DECIMALS: must match your token (likely 18)
    const DECIMALS = Number(process.env.PATRON_DECIMALS || "18");

    // 🔑 1 PATRON = 1 USD by default
    // If PATRON_PER_USD is not set, this falls back to 1:1.
    const PATRON_PER_USD = Number(process.env.PATRON_PER_USD || "1");

    // ---- Basic validation ----
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

    // ---- Compute token amount ----
    // 1 USD = PATRON_PER_USD PATRON (with your mapping, this is 1:1)
    const patronAmount = usdNum * PATRON_PER_USD;
    const amountWei = ethers.parseUnits(String(patronAmount), DECIMALS);

    console.log(
      `Sending ${patronAmount} PATRON to ${address} (${amountWei.toString()} base units)`,
      paymentTxHash ? `for payment tx ${paymentTxHash}` : ""
    );

    // ---- Provider + signer ----
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

    const patron = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);

    // Optional sanity check: ensure treasury has enough PATRON
    const treasuryAddress = await signer.getAddress();
    const treasuryBal = await patron.balanceOf(treasuryAddress);

    if (treasuryBal < amountWei) {
      console.error("Insufficient PATRON in treasury", {
        treasury: treasuryAddress,
        treasuryBal: treasuryBal.toString(),
        needed: amountWei.toString(),
      });
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Treasury lacks sufficient PATRON to fulfill purchase",
        }),
      };
    }

    // ---- Transfer PATRON from treasury/admin to buyer ----
    const tx = await patron.transfer(address, amountWei);
    console.log("PATRON transfer tx sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("PATRON transfer confirmed");

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