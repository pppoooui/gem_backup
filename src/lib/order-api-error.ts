import { ZodError } from "zod";
import { CheckoutInputError } from "@/lib/orders";

export function toOrderApiError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      status: 400,
      message: error.issues[0]?.message ?? "Invalid order details",
    };
  }

  if (error instanceof CheckoutInputError) {
    return { status: 400, message: error.message };
  }

  if (error instanceof SyntaxError) {
    return { status: 400, message: "Invalid JSON body" };
  }

  return { status: 500, message: "Unable to create order" };
}
