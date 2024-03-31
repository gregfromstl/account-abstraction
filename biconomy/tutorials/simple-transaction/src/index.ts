import "dotenv/config";
import { createSmartAccountClient } from "@biconomy/account";
import { createWalletClient, encodeFunctionData, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { http } from "viem";

async function main() {
    const account = privateKeyToAccount(
        process.env.PRIVATE_KEY! as `0x${string}`
    );

    const signer = createWalletClient({
        account: account,
        chain: sepolia,
        transport: http(),
    });

    const smartWallet = await createSmartAccountClient({
        signer,
        bundlerUrl: process.env.BUNDLER_URL!,
    });

    const saAddress = await smartWallet.getAccountAddress();
    console.log("SA Address", saAddress);

    // replace this with your own function call
    const request = encodeFunctionData({
        abi: parseAbi(["function mint()"]),
        functionName: "mint",
        args: [],
    });

    const tx = {
        to: "0xe5fa7b69A2315eaa234CCA7697738317a84fd31b",
        data: request,
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
