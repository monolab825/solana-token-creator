import React, { useState } from 'react';
import Button from './Button'; // Import the Button component
import { Connection, PublicKey, Transaction, clusterApiUrl, SystemProgram } from '@solana/web3.js';

function App() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [metadataUrl, setMetadataUrl] = useState('');
  const [supply, setSupply] = useState(0);
  const [decimals, setDecimals] = useState(0);

  const isWalletConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found");
          // Connect to Phantom wallet
          const response = await solana.connect({ onlyIfTrusted: false });
          console.log("Public key:", response.publicKey.toString());
          setConnected(true);
          setPublicKey(response.publicKey.toString());
        } else {
          alert("Please install Phantom wallet");
        }
      }
    } catch (error) {
      console.error("Error connecting to Phantom wallet:", error);
    }
  };

  const createToken = async () => {
    if (!connected) {
      console.error('Wallet not connected');
      return;
    }

    // Validate input values
    if (!name || !symbol || !metadataUrl || supply <= 0 || decimals < 0) {
      console.error('Invalid token parameters');
      return;
    }

    // Connection to Solana Devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Generate a unique seed for each token account based on token name, symbol, and a random component
    const randomComponent = Math.random().toString(36).substring(7); // Generate a random string
    const tokenSeed = `${name}-${symbol}-${randomComponent}`;

    // Create the token account using the generated seed
    const token = await PublicKey.createWithSeed(new PublicKey(publicKey), tokenSeed, new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'));

    // Initialize the token account
    const initTokenAccountIx = SystemProgram.createAccountWithSeed({
      fromPubkey: new PublicKey(publicKey),
      basePubkey: new PublicKey(publicKey),
      seed: tokenSeed,
      newAccountPubkey: token,
      lamports: await connection.getMinimumBalanceForRentExemption(165),
      space: 165, // Size of account data
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') // Token program's public key
    });
    
    // Initialize token account instruction
    const tx = new Transaction().add(initTokenAccountIx);

    // Get recent blockhash
    const { blockhash } = await connection.getRecentBlockhash();

    // Set recent blockhash
    tx.recentBlockhash = blockhash;

    // Set fee payer
    tx.feePayer = new PublicKey(publicKey);

    // Sign transaction
    const signedTx = await window.solana.signTransaction(tx);

    // Send transaction
    const txId = await connection.sendRawTransaction(signedTx.serialize());

    console.log('Token account created:', token.toString(), 'Transaction ID:', txId);
  };

  return (
    <div className="App">
      <Button handleClick={isWalletConnected} buttonText="Connect Wallet" />
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Symbol:</label>
        <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      </div>
      <div>
        <label>Metadata URL:</label>
        <input type="text" value={metadataUrl} onChange={(e) => setMetadataUrl(e.target.value)} />
      </div>
      <div>
        <label>Supply:</label>
        <input type="number" value={supply} onChange={(e) => setSupply(e.target.value)} />
      </div>
      <div>
        <label>Decimals:</label>
        <input type="number" value={decimals} onChange={(e) => setDecimals(e.target.value)} />
      </div>
      <Button handleClick={createToken} buttonText="Create Token" disabled={!connected} />
      {publicKey && <p>Connected with public key: {publicKey}</p>}
    </div>
  );
}

export default App;
