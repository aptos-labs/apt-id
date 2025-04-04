# Apt ID: Comprehensive Review

## Overview

Apt ID is a decentralized identity platform built on the Aptos blockchain that functions similarly to Linktree. It allows users to create a profile linked to their Aptos Name Service (ANS) name, where they can add biographical information and links to various platforms. The project demonstrates several key features of the Aptos blockchain and Move programming language.

## Project Origin and Purpose

According to Greg Nazario (the creator), Apt ID was developed in late 2024 as a way to provide additional utility to Aptos Name Service (ANS) names. As Greg mentioned in the transcript:

> "At the end of 2024, I was kind of getting bored of doing my normal day to day job and I wanted to have something a little bit more fun and a little more exciting. So one of the things I did was I was talking with people. What can we do more fun with aptos names? So we decided, all right, let's make a decentralized link tree."

The project aims to:

1. Create a decentralized alternative to centralized profile link services like Linktree
2. Integrate with Aptos Name Service to leverage existing digital identities
3. Test and showcase new Move language features and Aptos capabilities
4. Potentially allow users to use NFTs as profile pictures (feature not fully implemented)

The decentralized nature of Apt ID means that once a user has an ANS name, they have complete control over their profile data without relying on centralized services.

## Technical Architecture

### Smart Contract (Move)

The contract (`profile.move`) is the core of the application, handling on-chain storage and operations for user profiles. Key components include:

1. **Data Structures**:
   - `Bio`: Stores profile information like name, description, and avatar (can be URL or NFT)
   - `LinkTree`: Manages a collection of links using a SimpleMap
   - `Link`: Represents individual links with their URLs
   - `ProfileRef`: Associates a user's account with their profile object
   - `Controller`: Manages object extension and deletion capabilities

2. **Core Functions**:
   - `create`: Creates a new profile or updates an existing one
   - `set_bio`: Updates profile information
   - `add_links`: Adds links to a profile
   - `remove_links`: Removes links from a profile
   - `delete`: Deletes a profile and returns any NFTs

3. **View Functions**:
   - `get_profile_address`: Gets the profile address for an account
   - `profile_exists`: Checks if a profile exists
   - `image_url`: Gets the profile image URL
   - `view_bio`: Gets the profile bio
   - `view_links`: Gets the profile links

4. **Events**:
   - `BioChangeEvent`: Emitted when a bio is changed
   - `LinkTreeChangeEvent`: Emitted when links are changed
   - `DeleteProfileEvent`: Emitted when a profile is deleted
   
   As Greg noted in the transcript, these events were added after initial development when he realized their importance for indexing:
   
   > "The third thing I learned, and this is always the pitfall, is you got to remember to put events in your contract beforehand or it's really hard to index."

### Package Configuration (Move.toml)

The `Move.toml` file configures the Move package with:

1. **Package Metadata**:
   - Name: "Profile"
   - Version: "1.0.0"

2. **Addresses**:
   - Uses a placeholder (`profile_address = "_"`) for flexible deployment
   - Defines development addresses for testing

3. **Dependencies**:
   - AptosFramework and AptosTokenObjects from the aptos-framework repository
   - Currently configured for testnet (with TODO comment to change to mainnet for production)

Greg explained the importance of unique package naming:

> "The name of the package and the package can be any character. Any alphanumeric characters have underscores. I think they have dashes and be capitalized and whatever that is a unique key for all the packages in this account or this address."

### Frontend (TypeScript/Next.js)

The frontend is built with Next.js and TypeScript, providing a user-friendly interface for profile creation and viewing:

1. **Key Components**:
   - `WalletSelector`: Handles wallet connection using Aptos Wallet Adapter
   - `PublicProfile`: Displays user profiles with their bio and links
   - `ProfileClient`: Manages profile data fetching and state
   - `useAptosName`: Custom hook for ANS name resolution

2. **Configuration**:
   - Network settings (testnet/mainnet) in `constants.ts`
   - Contract address configuration

3. **Features**:
   - Responsive design for various devices
   - IPFS URL resolution for profile images
   - Dynamic link icons based on URL patterns
   - Profile sharing functionality
   - Edit mode for profile owners

## Key Technical Features

### Move Language Features

1. **Object Model**: The contract utilizes Aptos' object model, allowing data to be associated with users rather than contracts.
   ```move
   struct Bio has key, store {
       name: String,
       image_url: String,
       description: String,
   }
   ```

2. **Enums**: Utilized for event types and data structures, demonstrating newer Move features:
   ```move
   #[event]
   enum ProfileEvent has drop, copy {
       CreatedProfile { owner: address },
       UpdatedBio { owner: address, bio: Bio },
       AddedLink { owner: address, link: Link },
       RemovedLink { owner: address, name: String },
   }
   ```

3. **Resource Abilities**: The contract uses Move's ability system (key, store, copy, drop) to control how resources can be used. Greg explained:

   > "Copy allows you to copy like the actual data in the struct around that can be good or bad depending on your use case. And then drop lets you drop the data."

   > "For example, if you want an NFT or you know, a token, that's worth money. Do I want to be able to drop my USDC on the floor? Probably not. Do I want to be able to copy my usdc? No."

4. **Zero Address Ownership**: Using `0x0` as the owner for certain objects to prevent special privileges:
   ```move
   // Hard-coded 0x0 to ensure no one can own this object
   let owner = @0x0;
   ```

   As Greg explained:
   
   > "The way that objects work is that the owner can usually access things on the object. Sometimes if I want, the owner can create a signer or do other things. They have special privileges. So the way that I made it so that it wouldn't have special privileges is I made it go to 0x0 because no one can. Basically, 0x0 is a special address. No one can own it, no one can sign for it."

### Aptos-Specific Features

1. **Account & Address Model**: Unlike Ethereum where contracts are deployed to separate addresses, Aptos allows co-location of code and state at the same address. As Greg explained:

   > "On aptos you can co locate state and code in the same place. So in this case you can deploy multiple contracts to one address, you can deploy other software, other data, other store it. Like you can put tokens there, whatever versus in Ethereum is all stored in a single contract address."

2. **Aptos Name Service (ANS) Integration**: Profiles are tied to ANS names, requiring users to own a name before creating a profile.

3. **Aptos Connect**: Simplifies wallet connection and transaction handling.

## Design Decisions and Considerations

### Module Organization

Greg mentioned that he initially considered splitting functionality into multiple modules (e.g., separate modules for bio and links) but opted for a monolithic approach to:

> "The security model of move is that only the model can access that struct. So if you go and you make it so all right, I have my bio struct is in one one file and my link is another file. That means I need a bunch of accessors and a bunch of setters and getters and then it feels like it's Java, which I don't want to do right now about creating all this extra functionality just to all this boilerplate just to make it in and out."

### Address and Package Naming

The project demonstrates important considerations around:

1. **Package naming**: Should be unique to avoid conflicts with other packages
2. **Address placeholders**: Uses underscores for addresses that need to be filled in at publish time
3. **Development addresses**: Configured separately from production addresses

As Greg explained:

> "The underscore means it's a placeholder. That means that it needs to be filled in with an address at time of publish, but you can use it within the code for ease of use."

### Indexing Considerations

An important lesson highlighted was the need to plan for indexing from the beginning by including appropriate events in the contract:

> "I actually struggled really hard to figure out how many people had made app ID profiles because I didn't put events in at the beginning to be able to track them. So that means I had to go and build a indexer that went and checked every single transaction and then go and see if they had created the resource for their account to make the profile rather than just streaming over a list of events and saying, hey, do I have someone create an event profile?"

## Potential Improvements and Extensions

Based on the codebase analysis and discussion between Tippi and Greg:

1. **NFT Profile Pictures**: Complete the implementation to allow users to set NFTs as profile pictures. As Greg mentioned:

   > "It's actually a hidden feature to add NFT as a profile picture, but I haven't fully completed it."

2. **Interactive Elements**: Greg suggested adding features like:

   > "You can add in. You can say like hey, you can add an little game on the profile, adds up a score or something like that."
   
   > "You could add pokes. Use Petra poke actually exact there's already an existing Petra poke functionality and you could add that onto the profile or something like that."

3. **Custom Icons**: Complete the implementation of custom icons for profile links that Greg mentioned was in preview:

   > "One of the things I added here was the ability to have your APPT ID profile change the little icons next to your."

4. **Module Refactoring**: Consider splitting the monolithic module into more focused components, as suggested in the code critique.

5. **Error Handling**: Implement more granular error codes and descriptive messages.

6. **ASDF Integration**: The README mentions using ASDF for package manager and VM management, but Greg suggested this could be removed:

   > "You can use npm. It doesn't matter."

7. **Testing Framework**: Enhance the testing suite, particularly for complex operations like NFT transfers.

## Development Environment and Deployment

The project can be run locally with:

```
cd typescript/
pnpm install
pnpm dev
```

For deployment, there are considerations around:

1. **Network Selection**: Switching between testnet and mainnet by updating:
   - `Move.toml` dependencies (changing `rev = "testnet"` to `rev = "mainnet"`)
   - `constants.ts` network and contract address values

2. **Address Management**: Filling in placeholder addresses with actual deployment addresses

## Conclusion

Apt ID represents a practical example of decentralized identity management on Aptos. It showcases the blockchain's unique features and demonstrates how to build full-stack dApps with Move and TypeScript. The project serves as both a useful tool for Aptos users and an educational resource for developers learning to build on the platform.

The design choices and implementation details provide insights into best practices for Move development and highlight important considerations around state management, event emission for indexing, and frontend integration.

As Greg mentioned, the project was intended as a way to explore new features of the Aptos platform:

> "I actually decided to go and test a bunch of the new features. And this is actually how I learn how to build new stuff on aptos is by building random dapps."

This exploratory approach makes Apt ID not just a useful application but also a valuable learning resource for the Aptos developer community.