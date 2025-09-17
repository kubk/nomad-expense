import Papa from "papaparse";

export async function parseCSVFromFile(
  file: File,
): Promise<Record<string, string>[]> {
  const content = await file.text();

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(
      `CSV parsing errors: ${result.errors.map((e) => e.message).join(", ")}`,
    );
  }

  return result.data;
}
