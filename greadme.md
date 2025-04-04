# Apt ID

![Apt ID](typescript/public/aptos.png)

The codebase for [Apt ID](https://aptid.xyz), a profile based experience attached to an Aptos name. Built by Greg Nazario, with :heart:

> "At the end of 2024, I was kind of getting bored of doing my normal day-to-day job and I wanted to have something a little bit more fun and a little more exciting. So we decided, all right, let's make a decentralized link tree." *- Greg*

## What is Apt ID?

[Apt ID](https://aptid.xyz) is a profile based experience exclusively attached to a primary Aptos name. It may expand into a more complex social experience, or just stick with the linktree-like experience.

The platform uses Aptos blockchain technology to store profile data on-chain, giving users complete control over their profiles.

> "So the ANS name gives you basically claim to the namespace and then you can put anything you want there. Like there's no protections about what you can put there. **Don't put anything bad please.** But it's fully decentralized so like you can change it whenever you want, you can create it, delete it, whatever. *- Greg*"

## Features

- **Profile Creation**: Create a profile linked to your ANS name
- **Bio Management**: Set your name, description, and avatar image
- **Link Management**: Add, edit, and remove links to various platforms
- **Public Profile Viewing**: Share your profile with a clean, responsive UI
- **NFT Avatar Support**: Support for NFT profile pictures (in development)

> "It's actually a hidden feature to add NFT as a profile picture, but I haven't fully completed it. I tested out the enums specifically for this purpose and how hard it would be to build, as well as indexing to see how many users were using it." *- Greg*

## Technology Stack

### Smart Contract (Move)

The core of Apt ID is a Move contract that manages profile data on-chain:

```move
struct Bio has key, store {
    name: String,
    image_url: String,
    description: String,
}
```

> "I actually decided to go and test a bunch of the new features. This is how I learn how to build new stuff on Aptos - by building random dapps. I used all the things around enums and new assertions and plus-equals things like that. Lots of new features that made it a lot easier to code in Move today." *- Greg*

### Object Model & Resource Groups

The contract uses Aptos' object model and resource groups for efficient storage:

```move
#[resource_group_member(group = aptos_framework::object::ObjectGroup)]
```

> "The resource group is just a collection of structs in a B-tree, but they can be any structs. In this case, we have the object group that's not just things that come from the framework, it's also things that you may add yourself. So it's not necessarily tied to the framework, but just tied to a single identity of what the tree is." *- Greg*

## Development

### Running Locally

Simply install the dependencies and run dev mode. You'll need pnpm or npm or yarn. Oh and the [Aptos CLI](https://aptos.dev/en/build/cli) will help with all the blockchain stuff.

```bash
cd typescript/
pnpm install
pnpm dev
```

> **Tippi:** "Originally you used asdf as a version manager, what do we sacrifice for not using it in our installs?"  
> **Greg:** "There's npm, pnpm, Yarn, Deno, Bun. They all have different formats. Whatever. They all do different things, different performance. PNPM is faster than npm. Okay. That's really the only real advantage. Now the problem is the version. If you're using a different major version of the pnpm, it gives a different output file for the lock file. So the main problem for me was that some of the stuff we have is in version 8, some of the stuff we have is version 9, and some of the stuff is in version 10. So because they have different lock files, if you make it with the wrong one, the CI system breaks and then it doesn't work.

### Smart Contract Deployment

1. Navigate to the Move directory:
   ```
   cd move/
   ```

2. Compile the contract:
   ```
   aptos move compile
   ```

3. Publish to testnet (ensure you have an Aptos account configured):
   ```
   aptos move publish --named-addresses profile_address=$(aptos config show-profiles | grep -i default | awk '{print $3}')
   ```

4. Update the `CONTRACT_ADDRESS` in `typescript/src/constants.ts` with your deployed contract address.

> "You generally want those dependencies Aptos framework rev to be mainnet at all times. If you use TestNet or DevNet and you use a feature that's only in TestNet or DevNet and you try to deploy to MainNet, it will stop you or your contract won't work." *- Greg*

## Key Technical Concepts

### Aptos Account & Address Model

Unlike Ethereum where contracts are deployed to separate addresses, Aptos allows co-location of code and state:

```move
module profile_address::profile {
    // Contract code here
}
```

> "On Aptos you can co-locate state and code in the same place. You can deploy multiple contracts to one address, you can deploy other software, other data, you can put tokens there, whatever. Versus in Ethereum, it's all stored in a single contract address. The purpose of this was for the original purpose of Diem, and it was for the idea that you wanted to be able to separate data specifically for users and not let other people access it." *- Greg*

### Move Package Configuration

The Move.toml file manages dependencies and addresses:

```toml
[addresses]
profile_address = "_"
```

> "The underscore means it's a placeholder. That means that it needs to be filled in with an address at time of publish, but you can use it within the code for ease of use. This is particularly useful because you might have different addresses between environments. If we have a placeholder, I can easily just change it." *- Greg*
*
### Zero Address Ownership

A unique pattern used for NFT handling:

```move
// Hard-coded 0x0 to ensure no one can own this object
let owner = @0x0;
```

> "The way that objects work is that the owner can usually access things on the object. The owner can create a signer or do other things. They have special privileges. So the way that I made it so that it wouldn't have special privileges is I made it go to 0x0 because no one can own it, no one can sign for it. So that means that it essentially has no owner. But I still get the benefits of having object and all the pieces that go with that." *- Greg*

## Key Learnings & Best Practices

From my experience developing Apt ID, I've learned several important lessons:

### 1. Event Planning for Indexing

Always add events to your contract from the beginning for easier indexing (otherwise you might have to build your own indexer later to track that):

```move
#[event]
enum ProfileEvent has drop, copy {
    CreatedProfile { owner: address },
    UpdatedBio { owner: address, bio: Bio },
    AddedLink { owner: address, link: Link },
    RemovedLink { owner: address, name: String },
}
```

> "Remember to put events in your contract beforehand or it's really hard to index. I actually struggled really hard to figure out how many people had made Apt ID profiles because I didn't put events in at the beginning. So I had to build an indexer that checked every single transaction to see if they had created the resource, rather than just streaming over a list of events and saying, 'Hey, do I have someone creating an profile event here?'" *- Greg*

### 2. Function Visibility

Start with private functions and only make them public when necessary:

> "Don't make things public unless you have to because then you can't change them. Functions start off not public and then fix it later." - Greg

### 3. Resource Group Efficiency

Resource groups provide storage efficiency, but consider when to use them:

> "If you are building an object and you're putting resources on an object, put this [resource_group_member] line above it. The concept is actually kind of hard to explain because it's really about efficiency. For users it really doesn't matter usually, except from an object standpoint." - Greg

### 4. Network Deployment Strategy

Always test on testnet before deploying to mainnet:

> "Test it out in testnet before you go to mainnet. Don't test in production." - Greg

### 5. Package Naming Conventions

Choose unique package names to avoid conflicts:

> "The name of the package is very important because you have to deal with conflicts with other packages. Ideally you don't want to name your thing like 'Marketplace', because everyone made one named 'Marketplace'. And then you go and try to make your NFT aggregator and you have four different places called 'Marketplace'." - Greg

### 6. Module Organization

Consider the trade-offs between monolithic and modular approaches:

> "The security model of Move is that only the module can access that struct. So if you make your bio struct in one file and your link in another file, you need a bunch of accessors and setters and getters, and then it feels like Java. Usually what I'll do is I'll put things that are only used for one place to be in the same module." - Greg

## Future Features

Potential enhancements for Apt ID could include:

- **Interactive Elements**: Profile visit counters, games, or interactive components
- **Complete NFT Avatar Support**: Finalizing the NFT profile picture functionality
- **Social Features**: Following other profiles or activity feeds

> "You can say like, 'Hey, you can add a little game on the profile, adds up a score or something like that.' The first dapp I ever made was Tic Tac Toe on Aptos - it was multiplayer, all on chain." - Greg

## Contributing

Feel free to fork this project and build your own version or extension.

> "I think it would probably be better if people forked it and built their own things because the important thing there is that they get to build their own thing themselves. And they go through the whole process of publishing, getting a website up with it and all that." - Greg

For feature requests or bug reports, open a GitHub issue [here](https://github.com/aptos-labs/apt-id/issues).

## License

[MIT License](typescript/LICENSE)