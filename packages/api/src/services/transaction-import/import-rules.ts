import { TransactionImportRule } from "../../db/db-types";
import { TransactionFull } from "../../db/db-types";

export type TransactionLimited = Pick<
  TransactionFull,
  "description" | "isCountable"
>;

function makeTransactionUncountableRule<T extends TransactionLimited>(
  transaction: T,
  filters: TransactionImportRule[],
): T {
  const shouldMakeUncountable = filters
    .filter((filter) => filter.type === "MakeUncountable")
    .some((filter) => {
      return new RegExp(filter.name).test(transaction.description);
    });

  return shouldMakeUncountable
    ? { ...transaction, isCountable: false }
    : transaction;
}

function filterTransactionDescriptionRule<T extends TransactionLimited>(
  transaction: T,
  filters: TransactionImportRule[],
): T {
  const newDescription = filters
    .filter((filter) => filter.type === "FilterTransactionName")
    .reduce(
      (accumulator, current) =>
        accumulator.replace(new RegExp(current.name), ""),
      transaction.description,
    );

  return {
    ...transaction,
    description: newDescription,
  };
}

export function applyImportRules<T extends TransactionLimited>(
  transaction: T,
  importRules: TransactionImportRule[],
): T {
  const appliers = [
    makeTransactionUncountableRule,
    filterTransactionDescriptionRule,
  ];

  return appliers.reduce(
    (transaction, apply) => apply(transaction, importRules),
    transaction,
  );
}
