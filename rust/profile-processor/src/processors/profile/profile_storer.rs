use crate::db::common::models::profile_models::Profile;
use crate::{
    schema,
    utils::database::{execute_in_chunks, get_config_table_chunk_size, ArcDbPool},
};
use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::{
    traits::{async_step::AsyncRunType, AsyncStep, NamedStep, Processable},
    types::transaction_context::TransactionContext,
    utils::errors::ProcessorError,
};
use async_trait::async_trait;
use diesel::{
    pg::{upsert::excluded, Pg},
    query_builder::QueryFragment,
    ExpressionMethods,
};
use tracing::{error, info};

pub struct ProfileStorer
where
    Self: Sized + Send + 'static,
{
    conn_pool: ArcDbPool,
}

impl ProfileStorer {
    pub fn new(conn_pool: ArcDbPool) -> Self {
        Self { conn_pool }
    }
}

fn insert_profiles_query(
    items_to_insert: Vec<Profile>,
) -> (
    impl QueryFragment<Pg> + diesel::query_builder::QueryId + Send,
    Option<&'static str>,
) {
    use schema::profiles::dsl::*;
    (
        diesel::insert_into(schema::profiles::table)
            .values(items_to_insert)
            .on_conflict((transaction_version, account_address))
            .do_update()
            .set((inserted_at.eq(excluded(inserted_at)),)),
        None,
    )
}

#[async_trait]
impl Processable for ProfileStorer {
    type Input = Vec<Profile>;
    type Output = Vec<Profile>;
    type RunType = AsyncRunType;

    async fn process(
        &mut self,
        profile_changes: TransactionContext<Vec<Profile>>,
    ) -> Result<Option<TransactionContext<Vec<Profile>>>, ProcessorError> {
        let per_table_chunk_sizes: AHashMap<String, usize> = AHashMap::new();
        let execute_res = execute_in_chunks(
            self.conn_pool.clone(),
            insert_profiles_query,
            &profile_changes.data,
            get_config_table_chunk_size::<Profile>("profiles", &per_table_chunk_sizes),
        )
        .await;
        match execute_res {
            Ok(_) => {
                info!(
                    "Profile version [{}, {}] stored successfully",
                    profile_changes.metadata.start_version, profile_changes.metadata.end_version
                );
            }
            Err(e) => {
                error!("Failed to store profile: {:?}", e);
            }
        }
        Ok(Some(profile_changes))
    }
}

impl AsyncStep for ProfileStorer {}

impl NamedStep for ProfileStorer {
    fn name(&self) -> String {
        "ProfileStorer".to_string()
    }
}
