# MVMNT Blockchain Scripts

This repository contains blockchain interaction scripts for the MVMNT ecosystem, including LP Manager, Pool, and Staking Manager contracts.

## Structure

```
script/
├── LPManager/          # LP Manager contract scripts
├── pool/              # Pool contract scripts  
└── staking-manager/   # Staking Manager contract scripts
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment template:
```bash
cp env.example .env
```

3. Configure your `.env` file with your blockchain settings:
- `BLOCKCHAIN_PROVIDER_RPCURL`: Your RPC endpoint
- `ADMIN_KEY`: Your private key
- Contract addresses for your deployed contracts

## Usage

Each script folder contains individual JavaScript files that can be run directly:

### LP Manager Scripts
```bash
cd script/LPManager
node 01-initialize.js <btManager> <stablecoin> <poolImplementation> <dexRouter>
node 02-createPool.js <brandId>
node 03-initializePool.js <brandId>
```

### Pool Scripts
```bash
cd script/pool
node 01-initialize.js <brandId> <brandToken> <stablecoin> <manager>
node 02-addLiquidity.js <brandId> <tokenAmount> <stableAmount>
node 03-removeLiquidity.js <brandId> <lpAmount>
```

### Staking Manager Scripts
```bash
cd script/staking-manager
node 01-constructor.js <btManager> <lpManager>
node 02-initialize.js <stakingConfig>
node 03-setStakingConfig.js <config>
```

## Script Index Files

Each folder contains an `index.js` file that provides a class-based interface for all functions:

```javascript
const LPManager = require('./script/LPManager/index.js');
const Pool = require('./script/pool/index.js');
const StakingManager = require('./script/staking-manager/index.js');

// Initialize instances
const lpManager = new LPManager();
const pool = new Pool();
const stakingManager = new StakingManager();

// Use functions
await lpManager.execute('initialize', btManager, stablecoin, poolImplementation, dexRouter);
await pool.execute('addLiquidity', brandId, tokenAmount, stableAmount);
await stakingManager.execute('stakeBrandToken', brandId, amount);
```

## Dependencies

- `ethers`: Ethereum library for blockchain interactions
- `dotenv`: Environment variable management

## Security

⚠️ **Important**: Never commit your `.env` file or expose your private keys. Always use environment variables for sensitive data.
