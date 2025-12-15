export default function Home() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1>Settlr Octane Relay</h1>
      <p>Gasless transaction relay for Solana USDC payments.</p>

      <h2>Endpoints</h2>
      <ul>
        <li>
          <code>GET /api</code> - Get relay configuration
        </li>
        <li>
          <code>POST /api/transfer</code> - Submit gasless transaction
        </li>
        <li>
          <code>GET /api/health</code> - Health check
        </li>
      </ul>

      <h2>Usage</h2>
      <pre
        style={{
          background: "#1a1a1a",
          color: "#fff",
          padding: "1rem",
          borderRadius: "8px",
          overflow: "auto",
        }}
      >
        {`// 1. Get config
const config = await fetch('/api').then(r => r.json());

// 2. Build transaction with fee transfer
const tx = new Transaction();
tx.add(
  // Transfer fee to relay
  createTransferInstruction(
    userAta,
    config.feePayer, // Relay's token account
    user,
    config.endpoints.transfer.tokens[0].fee
  ),
  // Your actual transfer
  createTransferInstruction(...)
);

// 3. User signs (not fee payer)
tx.partialSign(userKeypair);

// 4. Submit to relay
const result = await fetch('/api/transfer', {
  method: 'POST',
  body: JSON.stringify({
    transaction: tx.serialize().toString('base64')
  })
}).then(r => r.json());

console.log('Signature:', result.signature);`}
      </pre>
    </main>
  );
}
