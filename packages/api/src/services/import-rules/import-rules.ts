import { TransactionImportRule } from "../../db/db-types";
import { Transaction } from "../../db/db-types";

export type TransactionLimited = Pick<Transaction, "description" | "isCountable">;

const makeTransactionUncountableRule = (
  transaction: TransactionLimited,
  filters: TransactionImportRule[]
): TransactionLimited => {
  const shouldMakeUncountable = filters
    .filter((filter) => filter.type === "MakeUncountable")
    .some((filter) => {
      return new RegExp(filter.name).test(transaction.description);
    });

  return shouldMakeUncountable ? { ...transaction, isCountable: false } : transaction;
};

const filterTransactionDescriptionRule = (
  transaction: TransactionLimited,
  filters: TransactionImportRule[]
): TransactionLimited => {
  const newDescription = filters
    .filter((filter) => filter.type === "FilterTransactionName")
    .reduce((accumulator, current) => accumulator.replace(new RegExp(current.name), ""), transaction.description);

  return {
    ...transaction,
    description: newDescription,
  };
};

export const applyImportRules = (
  transaction: TransactionLimited,
  importRules: TransactionImportRule[]
): TransactionLimited => {
  const appliers = [
    makeTransactionUncountableRule,
    filterTransactionDescriptionRule,
  ];

  return appliers.reduce(
    (transaction, apply) => apply(transaction, importRules),
    transaction
  );
};