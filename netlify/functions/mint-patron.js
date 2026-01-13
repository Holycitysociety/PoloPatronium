// netlify/functions/mint-patron.js
const { ethers } = require("ethers");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    console.log("mint-patron incoming body:", body);

    const { address, usdAmount, checkout, paymentTxHash } = body;

    // ------------------------------
    // Env vars / config
    // ------------------------------
    const RPC_URL = process.env.RPC_URL;
    const TOKEN_ADDRESS = process.env.PATRON_TOKEN_ADDRESS;
    const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
    const DECIMALS_STR = process.env.PATRON_DECIMALS ?? "18";
    const PATRON_PER_USD_STR = process.env.PATRON_PER_USD ?? "1";

    if (!RPC_URL) {
      throw new Error("Missing RPC_URL env var");
    }
    if (!TOKEN_ADDRESS) {
      throw new Error("Missing PATRON_TOKEN_ADDRESS env var");
    }
    if (!TREASURY_PRIVATE_KEY) {
      throw new Error("Missing TREASURY_PRIVATE_KEY env var");
    }

    const DECIMALS = Number(DECIMALS_STR);
    const PATRON_PER_USD = Number(PATRON_PER_USD_STR);

    if (!Number.isFinite(DECIMALS)) {
      throw new Error(`Invalid PATRON_DECIMALS: "${DECIMALS_STR}"`);
    }
    if (!Number.isFinite(PATRON_PER_USD) || PATRON_PER_USD <= 0) {
      throw new Error(`Invalid PATRON_PER_USD: "${PATRON_PER_USD_STR}"`);
    }

    // ------------------------------
    // Input validation
    // ------------------------------
    if (!address || !ethers.isAddress(address)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid address" }),
      };
    }

    const usdNum = Number(usdAmount);
    if (!Number.isFinite(usdNum) || usdNum <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid usdAmount" }),
      };
    }

    // 1 USD = 1 PATRON (as requested)
    const patronAmount = usdNum * PATRON_PER_USD;
    const amountWei = ethers.parseUnits(patronAmount.toString(), DECIMALS);

    console.log(
      `Minting ${patronAmount} PATRON (${amountWei.toString()} wei) to ${address}`,
      paymentTxHash ? `for payment tx ${paymentTxHash}` : ""
    );

    // ------------------------------
    // Ethers / contract
    // ------------------------------
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

    const patronAbi = [
      "function mint(address to, uint256 amount) public",
    ];

    const patron = new ethers.Contract(TOKEN_ADDRESS, patronAbi, signer);

    const tx = await patron.mint(address, amountWei);
    console.log("Mint tx sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Mint tx mined:", receipt.transactionHash);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        to: address,
        usdAmount,
        patronAmount,
        mintedAmountHuman: `${patronAmount} PATRON`,
        txHash: receipt.transactionHash,
        checkout,
        paymentTxHash: paymentTxHash || null,
      }),
    };
  } catch (err) {
    console.error("Mint error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || "Mint failed",
      }),
    };
  }
};