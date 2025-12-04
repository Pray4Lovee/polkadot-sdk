import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import fs from 'fs';

const LEDGER_FILE = "../ledger/offline_payments.json";

export async function signOffline(resource: string, amount: number, mnemonic: string) {
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(mnemonic);
    const signature = pair.sign(resource + amount.toString());
    const ledger = fs.existsSync(LEDGER_FILE) ? JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf-8')) : [];
    ledger.push({ resource, amount, signature });
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));
    console.log("💾 Offline signed stored:", resource);
}

export async function submitOffline(mnemonic: string) {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider });
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(mnemonic);

    const ledger = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf-8'));
    for (const entry of ledger) {
        const tx = api.tx.x402.authorizePayment(entry.resource, entry.amount, true);
        const hash = await tx.signAndSend(pair);
        console.log("✅ Offline payment submitted:", entry.resource, hash.toHex());
    }
    fs.writeFileSync(LEDGER_FILE, "[]");
}
