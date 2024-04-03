import "dotenv/config";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { createWalletClient, encodeFunctionData, http, parseAbi } from "viem";
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

    // replace this with your own function call
    const request = encodeFunctionData({
        abi: parseAbi(["function mint()"]),
        functionName: "mint",
        args: [],
    });

    const tx = {
        to: "0xbb6F64205FcE79EC5362fdBe3F73FBa04c67f8b8", // replace with your contract address
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
