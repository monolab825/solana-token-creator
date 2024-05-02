import React from 'react';
import { createMint, mintTo, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL  } from '@solana/web3.js';
import bs58 from 'bs58'; // Import bs58 for base58 encoding
import { Buffer } from 'buffer';
global.Buffer = Buffer;

const PRIVATE_KEY = ""; // Private key from phantom
const secret = bs58.decode(PRIVATE_KEY);

// Check if the pk is correct 
const payer = Keypair.fromSecretKey(secret);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mintAddress: null
    };
  }

  airDrop = async () => {

    const connection = new Connection(
      clusterApiUrl('devnet'),
      'confirmed'
    );

  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    LAMPORTS_PER_SOL,
  );

  await connection.confirmTransaction(airdropSignature);
};

  mintTokens = async () => {
    const mintAuthority = Keypair.generate();
    const freezeAuthority = Keypair.generate();

    const connection = new Connection(
      clusterApiUrl('devnet'),
      'confirmed'
    );

    

    const mint = await createMint(
      connection,
      payer,
      mintAuthority.publicKey,
      freezeAuthority.publicKey,
      9 // We are using 9 to match the CLI decimal default exactly
    );

    this.setState({ mintAddress: mint.toBase58() });

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    )

    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      mintAuthority,
      100000000000 // because decimals for the mint are set to 9 
    )


  };

  render() {
    return (
      <div>
        <h1>Solana Mint App</h1>
        <button onClick={this.airDrop}>Airdrop</button>
        <button onClick={this.mintTokens}>Mint Tokens</button>
        {this.state.mintAddress && (
          <p>Mint Address: {this.state.mintAddress}</p>
        )}
      </div>
    );
  }
}

export default App;
