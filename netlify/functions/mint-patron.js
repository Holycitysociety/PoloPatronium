const handleCheckoutSuccess = async (result) => {
  try {
    if (!account?.address) return;

    const resp = await fetch("/.netlify/functions/mint-patron", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: account.address,
        usdAmount: String(normalizedAmountNumber),
        checkout: {
          id: result?.id,
          amountPaid: result?.amountPaid ?? String(normalizedAmountNumber),
          currency: result?.currency ?? "USD",
        },
      }),
    });

    console.log("mint-patron status:", resp.status);

    const text = await resp.text();
    console.log("mint-patron raw response:", text);

    if (!resp.ok) {
      alert(
        "Payment succeeded, but we could not mint PATRON automatically.\n\n" +
          "Details: " + text
      );
      return;
    }

    const data = JSON.parse(text);
    console.log("mint-patron parsed:", data);

    alert(
      "Thank you — your patronage payment was received.\n\n" +
        `PATRON is being credited to your wallet.\n\nTx: ${data.txHash}`
    );
  } catch (err) {
    console.error("Error in handleCheckoutSuccess:", err);
    alert(
      "Payment completed, but there was an error minting PATRON.\n\n" +
        (err?.message || String(err))
    );
  }
};