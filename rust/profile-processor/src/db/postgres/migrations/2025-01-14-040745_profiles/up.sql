-- Your SQL goes here
CREATE TABLE profiles (
    account_address VARCHAR(66) NOT NULL,
    transaction_version BIGINT NOT NULL,
    transaction_block_height BIGINT NOT NULL,
    name VARCHAR(256),
    avatar_url VARCHAR(2048),
    inserted_at TIMESTAMP,
    PRIMARY KEY (transaction_version, account_address)
);
