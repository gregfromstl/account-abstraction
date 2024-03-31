import "dotenv/config";
import {
    type Hex,
    http,
    createWalletClient,
    encodeFunctionData,
    parseAbi,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createSmartAccountClient } from "@biconomy/account";

async function main() {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);
    const signer = createWalletClient({
        account,
        chain: sepolia,
        transport: http(),
    });

    const smartWallet = await createSmartAccountClient({
        signer,
        bundlerUrl: process.env.BUNDLER_URL!,
    });

    const saAddress = await smartWallet.getAddress();
    console.log("Smart Account Address:", saAddress);

    const request = encodeFunctionData({
        abi: parseAbi(["function mint()"]),
        functionName: "mint",
        args: [],
    });

    const tx = {
        to: "0xbb6F64205FcE79EC5362fdBe3F73FBa04c67f8b8", // replace with your contract address,
        data: request,
    };

    const userOpResponse = await smartWallet.sendTransaction([tx, tx]); // mint two NFTs
    const { transactionHash } = await userOpResponse.waitForTxHash();
    console.log("Transaction Hash:", transactionHash);

    const userOpReceipt = await userOpResponse.wait();
    if (userOpReceipt.success === "true") {
        console.log("UserOp receipt", userOpReceipt);
        console.log("Transaction receipt", userOpReceipt.receipt);
    } else {
        console.log("Failed UserOp", userOpReceipt);
    }
}

main();
