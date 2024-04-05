import {
    createThirdwebClient,
    prepareTransaction,
    sendAndConfirmTransaction,
    sendTransaction,
    toEther,
    toHex,
    toWei,
} from "thirdweb";
import { sepolia } from "thirdweb/chains";
import {
    getWalletBalance,
    privateKeyAccount,
    smartWallet,
} from "thirdweb/wallets";

const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

const localAccount = privateKeyAccount({
    client,
    privateKey: process.env.PRIVATE_KEY!,
});

const wallet = smartWallet({
    chain: sepolia,
    factoryAddress: process.env.FACTORY_ADDRESS!,
    gasless: false,
});
const smartAccount = await wallet.connect({
    client,
    personalAccount: localAccount,
});

const balance = await getWalletBalance({
    client,
    chain: sepolia,
    address: smartAccount.address,
});

if (balance.value < toWei("0.0015")) {
    console.log("Funding wallet...");
    const fundTx = prepareTransaction({
        to: smartAccount.address,
        value: toWei("0.002"),
        chain: sepolia,
        client,
    });
    const result = await sendAndConfirmTransaction({
        transaction: fundTx,
        account: localAccount,
    });
    console.log(result);
}

const transactionn = prepareTransaction({
    to: localAccount.address,
    chain: sepolia,
    client,
    value: toWei("0.001"),
});

const { transactionHash } = await sendAndConfirmTransaction({
    transaction: transactionn,
    account: smartAccount,
});
console.log("✅ Transaction complete", transactionHash);
