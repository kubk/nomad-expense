import { assembleTransactions } from "./assemble-transactions";
// @ts-ignore
const PDFJS = require(`pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js`);

export const ITEM_SEPARATOR = "___";
export const ROW_SEPARATOR = "\n\t\n\n";

const renderPage = (pageData: any) => {
  const options = {
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  };
  return pageData
    .getTextContent(options)
    .then((textContent: { items: any }) => {
      let lastY = undefined;
      let text = "";
      for (const item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          text += ITEM_SEPARATOR + item.str;
        } else {
          text += ROW_SEPARATOR + item.str;
        }
        lastY = item.transform[5];
      }
      return text;
    });
};

export const createKasikornParser = (password: string) => {
  return async (bankStatement: Buffer) => {
    const doc = await PDFJS.getDocument({
      data: bankStatement,
      password: password,
    });

    let text = "";

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      text = `${text}\n\n${await renderPage(page)}`;
    }

    const rows = text.split(ROW_SEPARATOR);

    return assembleTransactions(rows);
  };
};
