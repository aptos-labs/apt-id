// Copyright © Aptos Foundation
// SPDX-License-Identifier: Apache-2.0

#![allow(clippy::extra_unused_lifetimes)]

use crate::schema::profiles;
use aptos_indexer_processor_sdk::aptos_protos::transaction::v1::{
    write_set_change, WriteSetChange,
};
use diesel::{Identifiable, Insertable};
use field_count::FieldCount;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, FieldCount, Identifiable, Insertable, Serialize)]
#[diesel(primary_key(transaction_version, account_address))]
#[diesel(table_name = profiles)]
pub struct Profile {
    pub account_address: String,
    pub transaction_version: i64,
    pub transaction_block_height: i64,
    pub name: String,
    pub avatar_url: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct BioInfo {
    name: String,
    avatar_url: String,
}

impl Profile {
    pub fn from_change(
        write_set_change: &WriteSetChange,
        transaction_version: i64,
        transaction_block_height: i64,
    ) -> Option<Profile> {
        if let Some(write_set_change::Change::WriteResource(ref write_resource)) =
            write_set_change.change
        {
            let data: BioInfo = serde_json::from_str(write_resource.data.as_str()).ok()?;

            Some(Profile {
                account_address: write_resource.address.clone(),
                transaction_version,
                transaction_block_height,
                name: data.name,
                avatar_url: data.avatar_url, // TODO: Limit avatar URL length
            })
        } else {
            None
        }
    }
}

// Prevent conflicts with other things named `Event`
pub type ProfileModel = Profile;
