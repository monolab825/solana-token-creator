import React, { useState } from 'react';
import './App.css';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  PublicKey
} from '@solana/web3.js';
import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  mintTo,
  createAssociatedTokenAccount
} from '@solana/spl-token';
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';


function App() {

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenURI, setTokenURI] = useState('');
  const [tokenSupply, setTokenSupply] = useState('');

  const bs58 = require('bs58')
  const PRIVATE_KEY = "RLwE7dYGQpv7jKFjXcQRbUxDajzTrJWUX69hGNtYfFvv8wkvpckMMTsZhfF2fuXxwA2ik4dw7W3Nxbdd9GdEuLm"; // Private key from phantom
  const secret = bs58.decode(PRIVATE_KEY);

  const payer = Keypair.fromSecretKey(secret);

  // Check if the pk is correct 
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const mint = Keypair.generate();

  const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  );


  const mintTokens = async () => {

    

    
 

    
    const decimals = 9;

  const metadata = {
    mint: mint.publicKey,
    name: tokenName,
    symbol: tokenSymbol,
    uri: tokenURI,
    additionalMetadata: [['new-field', 'new-value']],
  };
  


  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  


  const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    try {

    
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
    createInitializeMintInstruction(mint.publicKey, decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint: mint.publicKey,
      metadata: mint.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    }),

    

  );


  mintTransaction.feePayer = payer.publicKey; // Set the fee payer
  

  const recentBlockhash = await connection.getRecentBlockhash();
  mintTransaction.recentBlockhash = recentBlockhash.blockhash;

  mintTransaction.sign(payer); // Add payer as a signer
  mintTransaction.sign(mint); // Add mint as a signer
  const signedTransaction = await window.solana.signTransaction(mintTransaction);
  const signature = await connection.sendRawTransaction(signedTransaction.serialize());
  


    
    console.log("Transaction confirmed with signature:", signature);
    console.log("Tokens minted successfully!");

    
   
    const mintBS58 = mint.publicKey.toBase58();
    console.log("Mint Address:", mintBS58);

  

    





  } catch (error) {
    console.error("Error minting tokens:", error);
  }




 





  }




  const mintXTokens = async () => {



    const tokenAccount = await createAssociatedTokenAccount(
      connection,
      payer,
      mint.publicKey,
      payer.publicKey,
      undefined,
      TOKEN_2022_PROGRAM_ID,
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
    


    await mintTo(
      connection,
      payer,
      mint.publicKey,
      tokenAccount,
      payer,
      parseInt(tokenSupply), // Parse token supply as an integer
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID 
    )



  }


  return (
    <div className="App">
      <input type="text" placeholder="Token Name" value={tokenName} onChange={(e) => setTokenName(e.target.value)} />
      <input type="text" placeholder="Token Symbol" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} />
      <input type="text" placeholder="Token URI" value={tokenURI} onChange={(e) => setTokenURI(e.target.value)} />
      <input type="text" placeholder="Token Supply" value={tokenSupply} onChange={(e) => setTokenSupply(e.target.value)} />
      <button onClick={mintTokens}>Mint Tokens</button>
      <button onClick={mintXTokens}>MintX Tokens</button>
    </div>
  );
}

export default App;