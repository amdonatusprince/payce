# Payce  

**Payce** is the first entirely on-chain autonomous payment infrastructure for businesses and merchants.

## Useful Resources
Demo Video: https://youtu.be/uu7GbqnAtQQ

Website URL: https://payce.vercel.app

Get 10 USDC here for testing on devnet: https://faucet.circle.com/

NB: Payce currently supports only Devnet for this demo. Solana Mainnet and Base usage will be live next week after the test is complete

## Features  

- **Seamless Payments**: Businesses, creators, and merchants can receive payments effortlessly from anyone.  
- **Batch Payments**: Send multiple payments to vendors or process employee payroll using the Payce Network’s batch payment feature.
- **Invoice Creation**: Businesses and merchants can generate invoices for their customers directly on Payce, making managing billing and payment collection easy.    
- **Transaction Insights**:  
  - Payce consumes data from the network to display comprehensive transaction history.  
  - Includes enriched transaction metadata for robust account statements.  

## Next Steps  

- **Embedded Wallet Integration**:  
  Implementing a custodial wallet infrastructure for Payce users to enhance accessibility and convenience.
- **AI Agent Integration**:  
  Integrating AI agents to completely automate all financial admin tasks and connect users to autonomous DeFi.

## Reown App Kit Integration

We use Reown's App Kit for seamless wallet connection and network validation. Here's how we utilize the key hooks:

```typescript
// Network Validation
const { caipNetwork } = useAppKitNetwork();
// Checks current network and ensures the user is on Solana

// Account Status
const { address, isConnected } = useAppKitAccount();
// Manages wallet connection state and user's address

// Connection Management
const { connection } = useAppKitConnection();
// Handles RPC connection to Solana network

// Wallet Provider
const { walletProvider } = useAppKitProvider<Provider>('solana');
// Provides Solana wallet interface for transactions
```
## Get Started  

### Prerequisites  

- Node.js  
- Yarn or npm  
- A supported browser for interacting with blockchain applications  

### Installation  

Clone the repository and navigate into the project directory:  

```bash  
git clone https://github.com/your-repo/payce.git  
cd payce  
```

Install dependencies:
```bash
npm  install 
```

Start the development server
```bash
npm run dev
```
