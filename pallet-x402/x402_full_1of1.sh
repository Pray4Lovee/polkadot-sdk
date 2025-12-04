#!/usr/bin/env bash
set -e

# -----------------------------
# CONFIGURATION
# -----------------------------
NODE_PATH="./target/release/node-template"
WS_PORT=9944
LEDGER_FILE="./ledger.json"
MNEMONIC="bottom drive obey lake curtain smoke basket hold race lonely fit walk"
RESOURCE="resource-test"
AMOUNT=1

# -----------------------------
# PREPARE LEDGER
# -----------------------------
mkdir -p "$(dirname "$LEDGER_FILE")"
echo "[]" > "$LEDGER_FILE"

# -----------------------------
# BUILD NODE
# -----------------------------
echo "🔹 Building Substrate node..."
cargo build --release

# -----------------------------
# START NODE
# -----------------------------
echo "🔹 Launching node..."
$NODE_PATH --dev --ws-port $WS_PORT &
NODE_PID=$!
sleep 10

# -----------------------------
# RUST INLINE CLIENT: OFFLINE SIGN + ONCHAIN SUBMIT + OOO + BENCH
# -----------------------------
echo "🔹 Running full Rust client..."
cargo run --release --package x402_client --bin x402_client -- \
    --ledger "$LEDGER_FILE" \
    --mnemonic "$MNEMONIC" \
    --resource "$RESOURCE" \
    --amount "$AMOUNT" \
    --ws "ws://127.0.0.1:$WS_PORT"

# -----------------------------
# STOP NODE
# -----------------------------
kill $NODE_PID
