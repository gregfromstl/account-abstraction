import "dotenv/config";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { encodeFunctionData, parseAbi } from "viem";
import { createThirdwebClient } from "thirdweb";
import { privateKeyAccount } from "thirdweb/wallets";
import { viemAdapter } from "thirdweb/adapters/viem";
import { sepolia } from "thirdweb/chains";

async function main() {
    const client = createThirdwebClient({
        clientId: process.env.THIRDWEB_CLIENT_ID!,
    });
    const account = privateKeyAccount({
        client,
        privateKey: process.env.PRIVATE_KEY! as `0x${string}`,
    });

    const signer = viemAdapter.walletClient.toViem({
        account: account,
        chain: sepolia, // replace with your chain definition
        client,
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
