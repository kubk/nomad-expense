import { DateTime } from "luxon";

type Transaction = {
  createdAt: Date;
  amount: number;
  info: string;
  title: string;
  currency: "THB";
};

export const ITEM_SEPARATOR = "___";

// Max amount of row a transaction can occupy in parsed PDF result
const MAX_TRANSACTION_ROW = 5;

const isBlank = (str: string) => !str || /^\s*$/.test(str);

const isStartOfTransactionRow = (row: string | null) => {
  return (row || "").match(/^\d{2}-\d{2}-\d\d?/);
};

export const isLookingLikeMoney = (moneyString: string) => {
  return !!moneyString.match(/^\d+(,\d+)?[.]\d\d$/);
};

export const parseMoney = (moneyString?: string) => {
  if (!moneyString || !isLookingLikeMoney(moneyString)) {
    throw new Error(
      `Unsupported money ${moneyString}. Type: ${typeof moneyString}`,
    );
  }

  const amount = parseInt(moneyString.replace(/[.,]/g, ""));
  if (isNaN(amount)) {
    throw new Error(`Invalid money: ${moneyString}`);
  }

  return amount;
};

const getDate = (dateString: string, timeString: string) => {
  const [day, month, year] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);

  // The PDF times are in Bangkok local time, so we create a DateTime in Bangkok timezone
  // This will properly convert 13:14 Bangkok time to the equivalent UTC time (06:14 UTC)
  const bangkokDateTime = DateTime.fromObject(
    {
      year: (year ?? 0) + 2000,
      month: month ?? 1,
      day: day ?? 1,
      hour: hour ?? 0,
      minute: minute ?? 0,
    },
    { zone: "Asia/Bangkok" },
  );

  if (!bangkokDateTime.isValid) {
    throw new Error(`Invalid date or time: ${dateString}:${timeString}`);
  }

  return bangkokDateTime.toJSDate();
};

const tryParseMoney = (row: string, columns: string[]) => {
  let tmpMoney: number | undefined;
  for (let i = 1; i < 4; i++) {
    try {
      tmpMoney = parseMoney(columns[columns.length - i]);
    } catch (e) {}
  }
  if (tmpMoney === undefined) {
    throw new Error("Unable to parse money from row: " + row);
  }
  return tmpMoney;
};

export const assembleTransactions = (rawPdfRows: string[]) => {
  let transactions: Transaction[] = [];
  const mergedPdfRows: string[] = [];
  const filteredRows = rawPdfRows.filter((row) => !!row);

  outerLoop: for (let i = 0; i < filteredRows.length; i++) {
    const row = filteredRows[i];

    if (
      !row ||
      !isStartOfTransactionRow(row) ||
      row.includes("Beginning Balance")
    ) {
      continue;
    }

    let temporaryTransaction = row;

    for (let j = 1; j < MAX_TRANSACTION_ROW; j++) {
      const innerRow = filteredRows[i + j];
      if (
        isStartOfTransactionRow(innerRow ?? null) ||
        j + 1 === MAX_TRANSACTION_ROW
      ) {
        mergedPdfRows.push(temporaryTransaction);
        continue outerLoop;
      } else {
        if (
          innerRow !== undefined &&
          !innerRow.includes("For more information") &&
          !innerRow.includes("Issued by K PLUS")
        ) {
          temporaryTransaction += ITEM_SEPARATOR + innerRow;
        }
      }
    }

    if (temporaryTransaction) {
      mergedPdfRows.push(row);
    }
  }

  mergedPdfRows.forEach((row) => {
    if (!isStartOfTransactionRow(row)) {
      return;
    }

    const columns = row.split(ITEM_SEPARATOR).filter((row) => !isBlank(row));
    if (columns.length < 4) {
      return;
    }

    if (columns[columns.length - 1] === "Open Account") {
      return;
    }

    const date = getDate(columns[0] ?? "", columns[1] ?? "");
    const info = columns[2] ?? "";
    const title = columns.slice(4, columns.length - 1).join(" / ");
    const amountSign = row.match(/Cash Deposit|Transfer Deposit/i) ? 1 : -1;
    const maybeMoney = tryParseMoney(row, columns);
    const amount = maybeMoney * amountSign;
    const currency = "THB" as const;

    if (
      title.includes("Error Correction") ||
      title.includes("Cash Withdrawal")
    ) {
      return;
    }

    transactions.push({
      createdAt: date,
      amount: amount,
      info,
      title,
      currency,
    });
  });

  return transactions;
};
