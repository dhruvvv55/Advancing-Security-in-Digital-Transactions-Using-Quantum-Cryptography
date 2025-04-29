require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28", // ✅ Set to match the Solidity version in your contract
  networks: {
    hardhat: {}, // ✅ Local Ethereum Blockchain
    localhost: {
      url: "http://127.0.0.1:8545", // ✅ Connect to Hardhat node
    },
  },
};
