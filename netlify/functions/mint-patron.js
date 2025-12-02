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
    const { address, usdAmount, paymentTxHash } = body;

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

    // Simple mapping: 1 USD = 1 PATRON (tunable)
    const patronAmount = usdNum * PATRON_PER_USD;
    const amountWei = ethers.parseUnits(String(patronAmount), DECIMALS);

    console.log(
      `Minting ${patronAmount} PATRON to ${address}`,
      paymentTxHash ? `for payment tx ${paymentTxHash}` : ""
    );

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

    // Minimal ABI – adjust if your contract uses a different mint function
    const patronAbi = [
      "function mint(address to, uint256 amount) public",
      "function transfer(address to, uint256 amount) public returns (bool)",
    ];

    const patron = new ethers.Contract(TOKEN_ADDRESS, patronAbi, signer);

    // If this signer can mint:
    const tx = await patron.mint(address, amountWei);

    // If instead you only transfer pre-minted tokens, use:
    // const tx = await patron.transfer(address, amountWei);

    const receipt = await tx.wait();

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
    console.error("Mint error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Mint failed" }),
    };
  }
};
