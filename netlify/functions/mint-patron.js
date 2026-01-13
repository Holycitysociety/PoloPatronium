// netlify/functions/mint-patron.js
const { ethers } = require("ethers");

// Minimal ERC-20 ABI for transfer-based distribution
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function decimals() public view returns (uint8)",
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
    const { address, usdAmount, paymentTxHash } = body || {};

    const RPC_URL = process.env.RPC_URL;
    const TOKEN_ADDRESS = process.env.PATRON_TOKEN_ADDRESS;
    const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
    const DECIMALS = Number(process.env.PATRON_DECIMALS || "18");
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
    // Simple mapping: 1 USD = PATRON_PER_USD whole tokens
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

    // Optional: sanity-check treasury balance
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