import "dotenv/config";
import {
    LocalAccountSigner,
    type SmartAccountSigner,
    sepolia,
    Hex,
    Address,
    SendUserOperationResult,
} from "@alchemy/aa-core";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { createPublicClient, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";

const PRIVATE_KEY = process.env.PRIVATE_KEY! as Hex;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY!;
const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL!;

async function fundSCA(address: Address) {
    const account = privateKeyToAccount(PRIVATE_KEY);

    const wallet = createWalletClient({
        account: account,
        chain: sepolia,
        transport: http(ALCHEMY_API_URL),
    });

    const txHash = await wallet.sendTransaction({
        to: address,
        value: parseEther("0.05"),
    });

    return txHash;
}

async function main() {
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(ALCHEMY_API_URL),
    });

    const signer: SmartAccountSigner =
        LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);

    const smartAccountClient = await createModularAccountAlchemyClient({
        signer,
        chain: sepolia,
        apiKey: ALCHEMY_API_KEY,
    });

    const counterfactualAddress = smartAccountClient.getAddress();

    if (
        (await publicClient.getBalance({ address: counterfactualAddress })) <
        parseEther("0.05")
    ) {
        console.log("Funding SCA...");
        const txHash = await fundSCA(counterfactualAddress);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
    }

    const amountToSend: bigint = parseEther("0.001");

    const result: SendUserOperationResult =
        await smartAccountClient.sendUserOperation({
            uo: {
                target: await signer.getAddress(),
                value: amountToSend,
                data: "0x",
            },
        });

    console.log("✔️ UserOp submitted to bundler...");

    const txHash = await smartAccountClient.waitForUserOperationTransaction(
        result
    );

    console.log("✅ UserOp confirmed!", txHash);

    await smartAccountClient.getUserOperationReceipt(result.hash as Hex);

    const txReceipt = await smartAccountClient.waitForTransactionReceipt({
        hash: txHash,
    });

    return txReceipt;
}

main()
    .then((txReceipt) => {
        console.log("\nTransaction receipt: ", txReceipt);
    })
    .catch((err) => {
        console.error("Error: ", err);
    })
    .finally(() => {
        console.log("\n--- DONE ---");
    });
