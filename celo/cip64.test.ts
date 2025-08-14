import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Transaction, } from '../src/index.ts';
import ERC20 from '../src/abi/erc20.ts';
import { createContract } from '../src/abi/decoder.ts';
import { bytesToHex } from '@noble/hashes/utils.js';
import { amounts } from '../src/utils.ts';

const random = {
    // Throw away key with dust cKES
    // 0x826b0BC989aCC4F3db2f777B67A9E9ED63B1f664
    privateKey: process.env.PRIVATE_KEY || '0xbc68607f0b38c619bcb6bdb6c17dff2539f720714c84c8613df564a665c12551',
};

// cKES
const FEE_CURRENCY = '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0';
const RECIPIENT = '0x5523058cdFfe5F3c1EaDADD5015E55C6E00fb439';

function encodeTransfer(to: string, value: bigint): Uint8Array {
    const contract = createContract(ERC20);
    return contract.transfer.encodeInput({ to, value });
}

test('cip64 erc20 transfer end-to-end signing & feeCurrency (ABI encode)', () => {
    const data = bytesToHex(encodeTransfer(RECIPIENT, 400000000000000000n));
    console.log('cip64 erc20 transfer data:', data);

    const tx = Transaction.prepare({
        chainId: 42220n,
        type: 'cip64',
        to: FEE_CURRENCY,
        value: 0n,
        data,
        maxFeePerGas: 1200n * amounts.GWEI,
        maxPriorityFeePerGas: 50n,
        gasLimit: 150000n,
        nonce: 8n,
        feeCurrency: FEE_CURRENCY,
    });

    const signedTx = tx.signBy(random.privateKey);
    console.log('cip64 erc20 signed tx hex:', signedTx.toHex());
    console.log('cip64 erc20 signed tx:', signedTx.raw);

    assert.equal(signedTx.raw.to, FEE_CURRENCY);

});
