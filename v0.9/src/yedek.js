import React, { useState } from 'react';
import './App.css';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
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
  createAssociatedTokenAccount,
  transfer
} from '@solana/spl-token';
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';


function App() {

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenURI, setTokenURI] = useState('');
  const [tokenSupply, setTokenSupply] = useState('');
  const [tokenDecimals, settokenDecimals] = useState('');
  


  const payer = Keypair.generate();

  // Check if the pk is correct 
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const mint = Keypair.generate();

  const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  );


  const mintTokens = async () => {

    await window.solana.connect();
   

    try {
      // Connect to Solana network
  
      // Get the public key of the recipient's wallet

  
      // Construct the transaction
      const transaction = new Transaction().add(
        // Add instruction to transfer SOL
        SystemProgram.transfer({
          fromPubkey: window.solana.publicKey,
          toPubkey: payer.publicKey,
          lamports: 0.1 * 10 ** 9, // Amount in SOL (1 SOL = 10^9 lamports)
        })
      );

      transaction.feePayer = window.solana.publicKey; // Set the fee payer
  
      const recentBlockhash = await connection.getRecentBlockhash();
      transaction.recentBlockhash = recentBlockhash.blockhash;
      // Sign and send the transaction
      const signature = await window.solana.signAndSendTransaction(transaction);
  
      // Confirm transaction
      await connection.confirmTransaction(signature);
      
      // Transaction successful
      console.log(`Transaction successful. Transaction signature: ${signature}`);
    } catch (error) {
      console.error('Error sending SOL:', error);
    }




 

    
    const decimals = tokenDecimals;

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


  const signature = await sendAndConfirmTransaction(connection, mintTransaction, [payer, mint]);
  


    
    console.log("Transaction confirmed with signature:", signature);
    console.log("Tokens minted successfully!");

    await connection.confirmTransaction(signature);
   
    const mintBS58 = mint.publicKey.toBase58();
    console.log("Mint Address:", mintBS58);

  

    


    await mintXTokens();


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
    
    const tokenSupplyX = parseInt(tokenSupply) * 10 ** tokenDecimals;


    await mintTo(
      connection,
      payer,
      mint.publicKey,
      tokenAccount,
      payer,
      tokenSupplyX, // Parse token supply as an integer
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID 
    )
    

    try {

      // Get the token account of the recipient (window.solana.publicKey)

      const recipientTokenAccount = await createAssociatedTokenAccount(
        connection,
        payer,
        mint.publicKey,
        window.solana.publicKey,
        undefined,
        TOKEN_2022_PROGRAM_ID,
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      )
      
      // Transfer tokens from the payer's associated token account to the recipient's associated token account
  
      await transfer(
        connection,
        payer,
        tokenAccount,
        recipientTokenAccount,
        payer,
        tokenSupplyX, // Parse token supply as an integer
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID 

      )

      console.log('Tokens transferred successfully!');
    } catch (error) {
      console.error('Error transferring tokens:', error);
    }
 

  }


  return (
    <div className="App">
      <input type="text" placeholder="Token Name" value={tokenName} onChange={(e) => setTokenName(e.target.value)} />
      <input type="text" placeholder="Token Symbol" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} />
      <input type="text" placeholder="Token URI" value={tokenURI} onChange={(e) => setTokenURI(e.target.value)} />
      <input type="text" placeholder="Token Supply" value={tokenSupply} onChange={(e) => setTokenSupply(e.target.value)} />
      <input type="text" placeholder="Token Decimals" value={tokenDecimals} onChange={(e) => settokenDecimals(e.target.value)} />
      <button onClick={mintTokens}>Mint Tokens</button>
    </div>
  );
}

export default App;