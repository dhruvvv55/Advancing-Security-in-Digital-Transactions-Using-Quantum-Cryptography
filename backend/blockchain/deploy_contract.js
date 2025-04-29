const hre = require("hardhat");

async function main() {
    const SecurePayments = await hre.ethers.getContractFactory("SecurePayments");
    const contract = await SecurePayments.deploy();  // ✅ Deploy the contract

    await contract.waitForDeployment();  // ✅ Wait for deployment

    console.log("✅ Smart Contract Deployed at:", contract.target);  // ✅ Log contract address
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
