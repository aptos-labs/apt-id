# Apt ID

![Screenshot](Screenshot.png)

## What is Apt ID?

Apt ID is a decentralized profile platform built on the Aptos blockchain. It functions similarly to Linktree, allowing users to create a profile linked to their Aptos Name Service (ANS) name where they can add biographical information and links to various platforms.

> "At the end of 2024, I was kind of getting bored of doing my normal day-to-day job and I wanted to have something a little bit more fun and a little more exciting. So we decided, all right, let's make a decentralized link tree." *- Greg Nazario, Creator*

The platform showcases key features of the Aptos blockchain and Move programming language while providing utility to ANS name owners.

## Features

- **Profile Creation**: Create a personal profile linked to your ANS name
- **Bio Management**: Set your name, description, and avatar image
- **Link Management**: Add, edit, and remove links to various platforms
- **Public Profile Viewing**: Share your profile with a clean, responsive UI
- **NFT Avatar Support**: (In development) Use NFTs as profile pictures

## Live Demo

Visit [Apt ID](https://aptid.xyz) to see the platform in action (on mainnet).

## Technology Stack

- **Smart Contract**: Move programming language on Aptos blockchain
- **Frontend**: Next.js, TypeScript, React
- **Wallet Connection**: Aptos Wallet Adapter
- **Name Resolution**: Aptos Name Service (ANS)
- **Styling**: Tailwind CSS

## Development

### Prerequisites

- Node.js (latest LTS recommended)
- pnpm, npm, or yarn package manager
- Aptos CLI (for contract deployment)
- An Aptos wallet (such as Petra)

### Running Locally

1. Clone the repository:
   ```
   git clone https://github.com/aptos-labs/apt-id.git
   cd apt-id
   ```

2. Install frontend dependencies:
   ```
   cd typescript/
   pnpm install  # or npm install
   ```

3. Start the development server:
   ```
   pnpm dev  # or npm run dev
   ```

> **Note:** "pnpm is faster" *- Greg*

4. Open your browser and navigate to `http://localhost:3000`

> **Note:** The application is configured to use testnet by default. You can modify the `constants.ts` file to switch to mainnet.

### Smart Contract Deployment

1. Navigate to the Move directory:
   ```
   cd move/
   ```

2. Compile the contract using that Aptos CLI:
   ```
   aptos move compile
   ```

3. Publish to testnet (example with Aptos CLI 'default' account configured):
   ```
   aptos move publish --named-addresses profile_address=default
   ```

4. Update the `CONTRACT_ADDRESS` in `typescript/src/constants.ts` with your deployed contract address.

## Architecture

### Smart Contract (Move)

The core of Apt ID is a Move contract that manages profile data on-chain:

- **Bio**: Stores profile information (name, description, avatar)
- **LinkTree**: Manages links using a SimpleMap
- **ProfileRef**: Associates accounts with profile objects
- **Events**: Emitted for indexing profile creations and updates

The contract leverages Aptos' object model, allowing data to be associated with users rather than contracts:

```move
struct Bio has key, store {
    name: String,
    image_url: String,
    description: String,
}
```

### Frontend (Next.js)

The frontend provides a user-friendly interface for profile management:

- **Public Profiles**: Resolved from ANS names (e.g., `username.apt`)
- **Profile Editor**: For authenticated users to manage their profiles
- **Wallet Connection**: Using Aptos Connect for authentication
- **Responsive Design**: For optimal viewing on all devices

## Key Technical Concepts

### Resource Groups

The contract uses Aptos resource groups for efficient storage:

```move
#[resource_group_member(group = aptos_framework::object::ObjectGroup)]
```

This allows related resources to be co-located in the same storage slot for faster access and better efficiency.

### Aptos Object Model

The project demonstrates the Object model, which provides:

- Ownership and transfer capabilities
- Co-location of related resources
- Composability (e.g., attaching NFTs to profiles)

### Zero Address Ownership

A unique pattern is used for NFT handling:

```move
// Hard-coded 0x0 to ensure no one can own this object
let owner = @0x0;
```

This prevents special privileges for the object owner since no one can sign for the zero address.

## Best Practices

Based on experience:

1. **Add Events Early**: Make sure to include events in your contract from the beginning for easier indexing:
   > "You got to remember to put events in your contract beforehand or it's really hard to index."

2. **Start with Private Functions**: Don't make functions public until necessary:
   > "Don't make things public unless you have to because then you can't change them."

3. **Test on Testnet**: Always test thoroughly on testnet before deploying to mainnet.

4. **Package Naming**: Use unique names for packages to avoid conflicts:
   > "It should be a unique name for your product that isn't common among everything else."

5. **Address Management**: Use named addresses with placeholders for flexible deployment.

## Contributing

Feel free to fork this project and build your own version or extension. If you've made improvements that you think would benefit the original project, open a pull request.

For feature requests or bug reports, open a GitHub issue [here](https://github.com/aptos-labs/apt-id/issues).

## License

[MIT License](typescript/LICENSE)

![Apt ID](typescript/public/aptos.png)