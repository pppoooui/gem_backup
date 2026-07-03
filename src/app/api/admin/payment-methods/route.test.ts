import { describe, expect, it, vi } from "vitest";
import { attachVisibleBankAccounts } from "./route";

describe("attachVisibleBankAccounts", () => {
  it("redacts bank accounts for non-superadmin admins", async () => {
    const loadAccounts = vi.fn(async () => [
      {
        id: "acct-1",
        account_number: "1234567890",
      },
    ]);

    const result = await attachVisibleBankAccounts(
      [{ id: "pay-xtransfer", name: "XTransfer" }],
      loadAccounts,
      false,
    );

    expect(result).toEqual([
      { id: "pay-xtransfer", name: "XTransfer", bank_accounts: [] },
    ]);
    expect(loadAccounts).not.toHaveBeenCalled();
  });
});
