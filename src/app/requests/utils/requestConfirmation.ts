/**
 * Utility function to wait for Request Network transaction confirmations
 * @param dataOrPromise - The Request Network transaction data or promise
 * @returns Promise that resolves when the transaction is confirmed
 */
export const waitForConfirmation = async (dataOrPromise: any) => {
  const data = await dataOrPromise;
  return new Promise((resolve, reject) => {
    data.on("confirmed", resolve);
    data.on("error", reject);
  });
};
