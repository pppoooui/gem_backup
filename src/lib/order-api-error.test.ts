import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";
import { CheckoutInputError } from "@/lib/orders";
import { toOrderApiError } from "@/lib/order-api-error";

describe("toOrderApiError", () => {
  it("returns useful validation messages as 400 responses", () => {
    let zodError: ZodError | undefined;
    try {
      z.object({ email: z.string().email() }).parse({ email: "invalid" });
    } catch (error) {
      zodError = error as ZodError;
    }

    expect(toOrderApiError(zodError)).toMatchObject({ status: 400 });
    expect(toOrderApiError(new CheckoutInputError("Cart is empty"))).toEqual({
      status: 400,
      message: "Cart is empty",
    });
    expect(toOrderApiError(new SyntaxError("Unexpected token"))).toEqual({
      status: 400,
      message: "Invalid JSON body",
    });
  });

  it("does not expose unexpected database errors", () => {
    expect(toOrderApiError(new Error("duplicate key value violates constraint"))).toEqual({
      status: 500,
      message: "Unable to create order",
    });
  });
});
