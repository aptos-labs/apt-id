use crate::db::common::models::profile_models::Profile;
use anyhow::Result;
use aptos_indexer_processor_sdk::aptos_protos::transaction::v1::{
    write_set_change, MoveStructTag, WriteResource,
};
use aptos_indexer_processor_sdk::{
    aptos_protos::transaction::v1::Transaction,
    traits::{async_step::AsyncRunType, AsyncStep, NamedStep, Processable},
    types::transaction_context::TransactionContext,
    utils::errors::ProcessorError,
};
use async_trait::async_trait;
use rayon::prelude::*;
use std::cell::LazyCell;
use std::string::ToString;

pub struct ProfileExtractor
where
    Self: Sized + Send + 'static, {}

static BIO_TAG: LazyCell<MoveStructTag> = LazyCell::new(|| MoveStructTag {
    address: "0x631f344549b798ad70cb5ab1842565b082fdfe488b7c6d56a257220222f6a191".to_string(),
    module: "profile".to_string(),
    name: "Bio".to_string(),
    generic_type_params: vec![],
});

static LINKTREE_TAG: LazyCell<MoveStructTag> = LazyCell::new(|| MoveStructTag {
    address: "0x631f344549b798ad70cb5ab1842565b082fdfe488b7c6d56a257220222f6a191".to_string(),
    module: "profile".to_string(),
    name: "LinkTree".to_string(),
    generic_type_params: vec![],
});

static PROFILE_REF_TAG: LazyCell<MoveStructTag> = LazyCell::new(|| MoveStructTag {
    address: "0x631f344549b798ad70cb5ab1842565b082fdfe488b7c6d56a257220222f6a191".to_string(),
    module: "profile".to_string(),
    name: "ProfileRef".to_string(),
    generic_type_params: vec![],
});

const CONTRACT_ADDR: &'static str =
    "0x631f344549b798ad70cb5ab1842565b082fdfe488b7c6d56a257220222f6a191";

#[async_trait]
impl Processable for ProfileExtractor {
    type Input = Vec<Transaction>;
    type Output = Vec<Profile>;
    type RunType = AsyncRunType;

    async fn process(
        &mut self,
        item: TransactionContext<Vec<Transaction>>,
    ) -> Result<Option<TransactionContext<Vec<Profile>>>, ProcessorError> {
        let profiles = item
            .data
            .par_iter()
            .map(|txn| {
                let txn_version = txn.version as i64;
                let block_height = txn.block_height as i64;

                // Txn info contains the writeset
                if let Some(ref txn_info) = txn.info {
                    // Filter for only with this contract address all others are unimportant
                    if !txn_info.changes.iter().any(|change| {
                        matches!(change, Some(write_set_change::Change::WriteResource(WriteResource {r#type: Some(MoveStructTag{address: CONTRACT_ADDR,..}), ..})))
                    }){
                        return vec![];
                    }

                    // Now that we know it's one we expect, we should get the associated data
                    let changes = txn_info.changes.iter().filter(|change|
                        matches!(change, Some(write_set_change::Change::WriteResource(WriteResource {r#type: Some(MoveStructTag{address: CONTRACT_ADDR,..}), ..})))
                    ).map(|change|

                        change.change.as_ref().unwrap()).collect();

                    txn_info.changes.iter().filter(|change| {
                        change.r#type == write_set_change::Type::WriteResource as i32 // TODO: Support deletes also
                    }).filter(|change| {
                        if let Some(write_set_change::Change::WriteResource(ref write_resource)) = change.change {
                            if let Some(ref resource_type) = write_resource.r#type {
                                return resource_type.address == "0x631f344549b798ad70cb5ab1842565b082fdfe488b7c6d56a257220222f6a191"
                                    && resource_type.module == "profile"
                                    && resource_type.name == "Bio";
                            }
                        }

                        false
                    }).filter_map(|change| Profile::from_change(change, txn_version, block_height)).collect()
                } else {
                    vec![]
                }
            })
            .flatten()
            .collect::<Vec<Profile>>();

        Ok(Some(TransactionContext {
            data: profiles,
            metadata: item.metadata,
        }))
    }
}

impl AsyncStep for ProfileExtractor {}

impl NamedStep for ProfileExtractor {
    fn name(&self) -> String {
        "ProfileExtractor".to_string()
    }
}
