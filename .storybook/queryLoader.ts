import { gql } from "@apollo/client/core";
import * as RealQueryLoader from "../src/queryLoader";

export * from "../src/queryLoader";

export const GetEntityHistoryVersionsDocument =
  RealQueryLoader.GetEntityHistoryVersionsDocument ??
  gql`
    query GetEntityHistoryVersions(
      $id: String!
      $type: String!
      $limit: Int
      $skip: Int
    ) {
      EntityHistoryVersions(id: $id, type: $type, limit: $limit, skip: $skip) {
        versionId
        documentVersion
        timestamp
        editedBy
      }
    }
  `;

export const GetEntityHistoryVersionDetailDocument =
  RealQueryLoader.GetEntityHistoryVersionDetailDocument ??
  gql`
    query GetEntityHistoryVersionDetail(
      $id: String!
      $type: String!
      $versionId: String!
    ) {
      EntityHistoryVersionDetail(id: $id, type: $type, versionId: $versionId) {
        id
      }
    }
  `;
