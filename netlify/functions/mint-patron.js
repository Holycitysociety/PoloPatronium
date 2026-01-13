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
    const { address, usdAmount, checkout, paymentTxHash } = body || {};

    const RPC_URL = process.env.RPC_URL;
    const TOKEN_ADDRESS = process.env.PATRON_TOKEN_ADDRESS;
    const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
    const DECIMALS = Number(process.env.PATRON_DECIMALS || "18");
    const PATRON_PER_USD = Number(process.env.PATRON_PER_USD || "1");

    // ---- Basic validation -------------------------------------------------
    if (!address || !ethers.isAddress(address)) {
      console.error("Mint error: invalid address", address);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid address", address }),
      };
    }

    const usdNum = Number(usdAmount);
    if (!usdNum || usdNum <= 0) {
      console.error("Mint error: invalid usdAmount", usdAmount);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid usdAmount", usdAmount }),
      };
    }

    if (!RPC_URL || !TOKEN_ADDRESS || !TREASURY_PRIVATE_KEY) {
      console.error("Mint error: missing env vars", {
        hasRPC: !!RPC_URL,
        hasToken: !!TOKEN_ADDRESS,
        hasPK: !!TREASURY_PRIVATE_KEY,
      });
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Missing required env vars",
          details: {
            hasRPC: !!RPC_URL,
            hasToken: !!TOKEN_ADDRESS,
            hasPK: !!TREASURY_PRIVATE_KEY,
          },
        }),
      };
    }

    // ---- Amount math: 1 USD = 1 PATRON (configurable) ---------------------
    const patronAmount = usdNum * PATRON_PER_USD; // e.g. 10 USD → 10 PATRON
    const amountWei = ethers.parseUnits(String(patronAmount), DECIMALS);

    console.log("Mint request received:", {
      to: address,
      usdAmount,
      patronAmount,
      checkoutId: checkout?.id,
      paymentTxHash,
      token: TOKEN_ADDRESS,
      decimals: DECIMALS,
      patronPerUsd: PATRON_PER_USD,
    });

    // ---- Chain + signer ---------------------------------------------------
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

    const treasuryAddress = await signer.getAddress();
    console.log("Treasury signer address:", treasuryAddress);

    const balance = await provider.getBalance(treasuryAddress);
    console.log("Treasury ETH balance (wei):", balance.toString());

    // ---- Token contract ---------------------------------------------------
    const patronAbi = [
      "function mint(address to, uint256 amount) public",
      "function transfer(address to, uint256 amount) public returns (bool)",
    ];

    const patron = new ethers.Contract(TOKEN_ADDRESS, patronAbi, signer);

    // If the signer has mint rights:
    let tx;
    try {
      tx = await patron.mint(address, amountWei);
      console.log("Mint tx sent:", tx.hash);
    } catch (mintErr) {
      console.error("Direct mint() failed, will not fallback to transfer", mintErr);
      // If you want to fallback to transfer of pre-minted tokens instead, uncomment:
      // tx = await patron.transfer(address, amountWei);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "mint() reverted",
          message: mintErr.message || String(mintErr),
        }),
      };
    }

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
      }),
    };
  } catch (err) {
    console.error("Mint error (outer catch):", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Mint failed",
        message: err.message || String(err),
      }),
    };
  }
};