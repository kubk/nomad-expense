export const copyToClipboard = async (text: string, onSuccess: () => void) => {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess();
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};
