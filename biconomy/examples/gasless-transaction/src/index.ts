import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { createWalletClient, encodeFunctionData, http, parseAbi } from "viem";
import { PaymasterMode, createSmartAccountClient } from "@biconomy/account";

async function main() {
    const account = privateKeyToAccount(
        process.env.PRIVATE_KEY! as `0x${string}`
    );

    const client = createWalletClient({
        account,
        chain: sepolia,
        transport: http(),
    });

    const smartWallet = await createSmartAccountClient({
        signer: client,
        biconomyPaymasterApiKey: process.env.PAYMASTER_API_KEY!,
        bundlerUrl: process.env.BUNDLER_URL!,
    });

    const saAddress = await smartWallet.getAddress();
    console.log("SA Address:", saAddress);

    const request = encodeFunctionData({
        abi: parseAbi(["function mint()"]),
        functionName: "mint",
        args: [],
    });

    const tx = {
        to: "0xbb6F64205FcE79EC5362fdBe3F73FBa04c67f8b8", // replace with your contract address,
        data: request,
    };

    const userOpResponse = await smartWallet.sendTransaction(tx, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
    });
    const { transactionHash } = await userOpResponse.waitForTxHash();
    console.log("Transaction hash", transactionHash);
    const userOpReceipt = await userOpResponse.wait();
    if (userOpReceipt.success == "true") {
        console.log("Transaction success", userOpReceipt.receipt);
    } else {
        console.log("Transaction failed");
    }
}

main();
