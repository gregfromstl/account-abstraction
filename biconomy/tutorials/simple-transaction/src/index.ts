import "dotenv/config";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

async function main() {
    const account = privateKeyToAccount(
        process.env.PRIVATE_KEY! as `0x${string}`
    );

    const signer = createWalletClient({
        account: account,
        chain: sepolia, // replace with your chain definition
        transport: http(),
    });

    const smartWallet = await createSmartAccountClient({
        signer: signer as SupportedSigner,
        bundlerUrl: process.env.BUNDLER_URL!,
    });

    const saAddress = await smartWallet.getAccountAddress();
    console.log("SA Address", saAddress);

    const tx = {
        to: signer.account.address, // send eth back to the local account
        value: parseEther("0.01"),
        data: "0x",
    };

    const userOpResponse = await smartWallet.sendTransaction(tx);
    const { transactionHash } = await userOpResponse.waitForTxHash();
    console.log("Transaction Hash", transactionHash);

    const userOpReceipt = await userOpResponse.wait();
    if (userOpReceipt.success === "true") {
        console.log("UserOp receipt", userOpReceipt);
        console.log("Transaction receipt", userOpReceipt.receipt);
    }
}

main();
