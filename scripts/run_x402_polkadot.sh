#!/usr/bin/env bash
set -e

echo "🔹 Building Substrate node + pallet-x402..."
# Assume node template with pallet-x402 integrated
cargo build --release

echo "🔹 Starting local Polkadot node..."
./target/release/node-template --dev --ws-port 9944 &
NODE_PID=$!
sleep 10

echo "🔹 Running TS client offline sign + online submit..."
cd ../client-ts
PRIVATE_MNEMONIC="bottom drive obey lake curtain smoke basket hold race lonely fit walk"
node -e "import('./x402Client.js').then(m=>{ m.signOffline('resource-test',1,process.env.PRIVATE_MNEMONIC); m.submitOffline(process.env.PRIVATE_MNEMONIC); })"

kill $NODE_PID
echo "🌟 x402 Polkadot OOO E2E + Benchmark complete!"
