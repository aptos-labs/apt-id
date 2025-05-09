// Copyright © Aptos Foundation
// SPDX-License-Identifier: Apache-2.0

#![allow(clippy::extra_unused_lifetimes)]

use crate::{schema::backfill_processor_status, utils::database::DbPoolConnection};
use diesel::deserialize;
use diesel::deserialize::{FromSql, FromSqlRow};
use diesel::expression::AsExpression;
use diesel::pg::{Pg, PgValue};
use diesel::serialize;
use diesel::serialize::{IsNull, Output, ToSql};
use diesel::sql_types::Text;
use diesel::{AsChangeset, ExpressionMethods, Insertable, OptionalExtension, QueryDsl, Queryable};
use diesel_async::RunQueryDsl;
use std::io::Write;

#[derive(Debug, PartialEq, FromSqlRow, AsExpression, Eq)]
#[diesel(sql_type = Text)]
pub enum BackfillStatus {
    // #[diesel(rename = "in_progress")]
    InProgress,
    // #[diesel(rename = "complete")]
    Complete,
}

impl ToSql<Text, Pg> for BackfillStatus {
    fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, Pg>) -> serialize::Result {
        match *self {
            BackfillStatus::InProgress => out.write_all(b"in_progress")?,
            BackfillStatus::Complete => out.write_all(b"complete")?,
        }
        Ok(IsNull::No)
    }
}

impl FromSql<Text, Pg> for BackfillStatus {
    fn from_sql(bytes: PgValue<'_>) -> deserialize::Result<Self> {
        match bytes.as_bytes() {
            b"in_progress" => Ok(BackfillStatus::InProgress),
            b"complete" => Ok(BackfillStatus::Complete),
            _ => Err("Unrecognized enum variant".into()),
        }
    }
}

#[derive(AsChangeset, Debug, Insertable)]
#[diesel(table_name = backfill_processor_status)]
/// Only tracking the latest version successfully processed
pub struct BackfillProcessorStatus {
    pub backfill_alias: String,
    pub backfill_status: BackfillStatus,
    pub last_success_version: i64,
    pub last_transaction_timestamp: Option<chrono::NaiveDateTime>,
    pub backfill_start_version: i64,
    pub backfill_end_version: i64,
}

#[derive(AsChangeset, Debug, Queryable)]
#[diesel(table_name = backfill_processor_status)]
/// Only tracking the latest version successfully processed
pub struct BackfillProcessorStatusQuery {
    pub backfill_alias: String,
    pub backfill_status: BackfillStatus,
    pub last_success_version: i64,
    pub last_updated: chrono::NaiveDateTime,
    pub last_transaction_timestamp: Option<chrono::NaiveDateTime>,
    pub backfill_start_version: i64,
    pub backfill_end_version: i64,
}

impl BackfillProcessorStatusQuery {
    pub async fn get_by_processor(
        backfill_alias: &str,
        conn: &mut DbPoolConnection<'_>,
    ) -> diesel::QueryResult<Option<Self>> {
        backfill_processor_status::table
            .filter(backfill_processor_status::backfill_alias.eq(backfill_alias))
            .first::<Self>(conn)
            .await
            .optional()
    }
}
