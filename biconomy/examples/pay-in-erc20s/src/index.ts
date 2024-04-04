import "dotenv/config";
import {
    createWalletClient,
    http,
    Hex,
    encodeFunctionData,
    parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseGoerli } from "viem/chains";
import { createSmartAccountClient, PaymasterMode } from "@biconomy/account";

/**
 * NOTE: This script WILL NOT WORK as is, because Biconomy only supports ERC20 tokens on Goerli testnets, which are all deprecated.
 * You can find a list of supported tokens here: https://docs.biconomy.io/supportedNetworks
 */

async function main() {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);
    const walletClient = createWalletClient({
        chain: baseGoerli,
        account: account,
        transport: http(),
    });

    const smartAccountClient = await createSmartAccountClient({
        signer: walletClient,
        biconomyPaymasterApiKey: process.env.PAYMASTER_API_KEY!,
        bundlerUrl: process.env.BUNDLER_URL!,
    });

    const saAddress = await smartAccountClient.getAddress();
    console.log("SA Address", saAddress);

    const request = encodeFunctionData({
        abi: parseAbi(["function mint()"]),
        functionName: "mint",
        args: [],
    });

    const tx = {
        to: "0xbb6F64205FcE79EC5362fdBe3F73FBa04c67f8b8", // replace with your contract address,
        data: request,
    };

    const userOp = await smartAccountClient.buildUserOp([tx], {
        paymasterServiceData: {
            mode: PaymasterMode.ERC20,
            preferredToken: "0xd6a8c1eee4d4e4ef998b911b03d52bc301d9b332",
        },
    });

    const { wait } = await smartAccountClient.sendTransaction(tx, {
        paymasterServiceData: {
            mode: PaymasterMode.ERC20,
            preferredToken: "0xd6a8c1eee4d4e4ef998b911b03d52bc301d9b332", // Supported tokens here: https://docs.biconomy.io/supportedNetworks
        },
    });

    const {
        receipt: { transactionHash },
        success,
    } = await wait();

    if (success == "true") {
        console.log("TX", transactionHash);
    }
}

main();
