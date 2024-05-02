import './App.css';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from '@solana/spl-token';
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';


function App() {

  const bs58 = require('bs58')
  const PRIVATE_KEY = ""; // Private key from phantom
  const secret = bs58.decode(PRIVATE_KEY);
  
  // Check if the pk is correct 
  

  const mintTokens = async () => {

    try {

    const payer = Keypair.fromSecretKey(secret);

    const mint = Keypair.generate();
    const decimals = 9;

  const metadata = {
    mint: mint.publicKey,
    name: 'TOKEN_NAME',
    symbol: 'SMBL',
    uri: 'URI',
    additionalMetadata: [['new-field', 'new-value']],
  };




  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');



  const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
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
  } catch (error) {
    console.error("Error minting tokens:", error);
  }









  }








  return (
    <div className="App">
      <button onClick={mintTokens}>Mint Tokens</button>
    </div>
  );
}

export default App;
