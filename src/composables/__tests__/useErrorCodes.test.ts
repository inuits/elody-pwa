import { describe, it, expect, vi, beforeEach } from "vitest";
import { useErrorCodes } from "../useErrorCodes";
import type { GraphQLError } from "graphql/error";
import type { ApolloError } from "@apollo/client/core";
import { PageStatus, ErrorCodeType } from "@/generated-types/queries";

const sharedMocks = vi.hoisted(() => ({
  setPageStatus: vi.fn(),
  displayErrorNotification: vi.fn(),
  clearStorage: vi.fn(),
  closeAllModals: vi.fn(),

  logout: vi.fn(),
  setTenantInSessionStorage: vi.fn(),
  resetAdvancedPermissions: vi.fn(),
}));

vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: vi.fn(() => ({
    clearStorage: sharedMocks.clearStorage,
  })),
}));

vi.mock("@/composables/usePageStatus", () => ({
  usePageStatus: vi.fn(() => ({
    setPageStatus: sharedMocks.setPageStatus,
  })),
}));

vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: vi.fn(() => ({
    displayErrorNotification: sharedMocks.displayErrorNotification,
  })),
}));

vi.mock("@/composables/useTenant", () => ({
  default: vi.fn(() => ({
    setTenantInSessionStorage: sharedMocks.setTenantInSessionStorage,
  })),
}));

vi.mock("@/main", () => ({
  auth: { logout: sharedMocks.logout },
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: vi.fn(() => ({
    closeAllModals: sharedMocks.closeAllModals,
  })),
}));

vi.mock("@/composables/usePermissions", () => ({
  resetAdvancedPermissions: sharedMocks.resetAdvancedPermissions,
}));

vi.mock("@/helpers", () => ({
  isAbortError: vi.fn((error) => error?.name === "AbortError"),
  getTranslatedMessage: vi.fn(
    (key: string, variables?: Record<string, string> | string[]) => {
      const translations: Record<string, string> = {
        "error-codes.W5014": "No metadata available for item with id {id}",
        "error-codes.W5001":
          "{prefix}Property {property} can only have one of the following values: {values}",
        "notifications.graphql-errors.forbidden.title": "Forbidden",
        "notifications.graphql-errors.forbidden.description":
          "You do not have permission.",
      };

      let msg = translations[key] || key;

      if (variables) {
        if (Array.isArray(variables)) {
          variables.forEach((val, index) => {
            msg = msg.replace(`{${index}}`, val);
          });
        } else {
          for (const [k, v] of Object.entries(variables)) {
            msg = msg.replace(`{${k}}`, v);
          }
        }
      }
      return msg.trim();
    },
  ),
}));

const createMockGraphQLError = (
  messageStr?: string,
  statusCode: number = 400,
  isAbort = false,
): GraphQLError => {
  return {
    name: isAbort ? "AbortError" : "GraphQLError",
    message: "test error",
    response: {
      errors: [
        {
          message: "Fallback message from root",
          extensions: {
            response: {
              status: statusCode,
              body: {
                message: messageStr,
              },
            },
          },
        },
      ],
    },
  } as unknown as GraphQLError;
};

const createMockHttpResponse = (
  urlPath: string,
  statusCode: number,
  bodyData: any,
  statusText: string = "Bad Request",
): Response => {
  return {
    url: `http://localhost${urlPath}`,
    status: statusCode,
    statusCode,
    statusText,
    json: vi.fn().mockResolvedValue(bodyData),
  } as unknown as Response;
};

const createMockApolloError = (body: any): ApolloError => {
  return {
    graphQLErrors: [
      {
        extensions: {
          response: { body },
        },
      },
    ],
  } as unknown as ApolloError;
};

describe("useErrorCodes", () => {
  let errorCodes: ReturnType<typeof useErrorCodes>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorCodes = useErrorCodes();
  });

  describe("handleGraphqlError", () => {
    it("should return an empty string if it is an abort error", async () => {
      const error = createMockGraphQLError("W5014 | id:552804", 400, true);
      const result = await errorCodes.handleGraphqlError(error);

      expect(result).toBe("");
      expect(sharedMocks.displayErrorNotification).not.toHaveBeenCalled();
    });

    it("should fallback to status code handlers if no error code matches (e.g. 404)", async () => {
      const error = createMockGraphQLError("Not Found Error", 404);
      const result = await errorCodes.handleGraphqlError(error);

      expect(result).toBe("");
      expect(sharedMocks.setPageStatus).toHaveBeenCalledWith(
        PageStatus.NotFound,
      );
    });

    it.each([
      {
        testName: "W5014 (Single variable)",
        message: "W5014 | id:552804",
        expectedMsg: "No metadata available for item with id 552804",
      },
      {
        testName: "W5001 (Multiple variables)",
        message:
          "W5001 | prefix: | property:title | values:an ISO639 language code - Property title can only have one of the following values: an ISO639 language code",
        expectedMsg:
          "Property title can only have one of the following values: an ISO639 language code",
      },
    ])(
      "should parse variables, translate, and notify for $testName",
      async ({ message, expectedMsg }) => {
        const error = createMockGraphQLError(message);

        const result = await errorCodes.handleGraphqlError(error);

        expect(result).toBe(expectedMsg);
        expect(sharedMocks.displayErrorNotification).toHaveBeenCalledTimes(1);
        expect(sharedMocks.displayErrorNotification).toHaveBeenCalledWith(
          "Error",
          expectedMsg,
        );
      },
    );
  });

  describe("handleHttpError", () => {
    it.each([
      { path: "/api/iiif/image/123", status: 500, name: "iiif" },
      { path: "/api/mediafile/download", status: 400, name: "mediafile" },
    ])(
      "should return an empty string and skip processing for $name paths",
      async ({ path, status }) => {
        const response = createMockHttpResponse(path, status, {});
        const result = await errorCodes.handleHttpError(response);

        expect(result).toBe("");
        expect(sharedMocks.displayErrorNotification).not.toHaveBeenCalled();
      },
    );

    it.each([
      {
        testName: "from body.message (object)",
        bodyData: {
          extensions: { response: { body: { message: "W5014 | id:998877" } } },
        },
        expectedMsg: "No metadata available for item with id 998877",
      },
      {
        testName: "from direct body string",
        bodyData: {
          extensions: { response: { body: "W5014 | id:554433" } },
        },
        expectedMsg: "No metadata available for item with id 554433",
      },
      {
        testName: "complex error from direct body string",
        bodyData: {
          extensions: {
            response: {
              body: "W5001 | prefix: | property:title | values:an ISO639 language code - Property title can only have one of the following values: an ISO639 language code",
            },
          },
        },
        expectedMsg:
          "Property title can only have one of the following values: an ISO639 language code",
      },
    ])(
      "should extract error code, translate, and notify $testName",
      async ({ bodyData, expectedMsg }) => {
        const response = createMockHttpResponse("/api/entities", 400, bodyData);

        const result = await errorCodes.handleHttpError(response);

        expect(result).toBe(expectedMsg);
        expect(sharedMocks.displayErrorNotification).toHaveBeenCalledTimes(1);
        expect(sharedMocks.displayErrorNotification).toHaveBeenCalledWith(
          "Error",
          expectedMsg,
        );
      },
    );
  });

  describe("Auth Handlers", () => {
    it.each([["R1001"]])(
      "should trigger logout flow for code %s",
      async (code) => {
        const error = createMockGraphQLError(code);

        await errorCodes.handleGraphqlError(error);

        expect(sharedMocks.logout).toHaveBeenCalledTimes(1);
        expect(sharedMocks.clearStorage).toHaveBeenCalled();
        expect(sharedMocks.resetAdvancedPermissions).toHaveBeenCalled();
        expect(sharedMocks.setPageStatus).toHaveBeenCalledWith(
          PageStatus.Unauthorized,
        );
      },
    );

    it.each([
      ["R1003", ErrorCodeType.Read],
      ["R1004", ErrorCodeType.Read],
      ["R1008", ErrorCodeType.Read],
    ])(
      "should trigger Access Denied (PageStatus) for code %s",
      async (code) => {
        const error = createMockGraphQLError(code);

        await errorCodes.handleGraphqlError(error);

        expect(sharedMocks.setPageStatus).toHaveBeenCalledWith(
          PageStatus.Forbidden,
        );
        expect(sharedMocks.closeAllModals).toHaveBeenCalled();
        expect(sharedMocks.displayErrorNotification).not.toHaveBeenCalled();
      },
    );

    it.each([
      ["W1003", ErrorCodeType.Write],
      ["W1004", ErrorCodeType.Write],
      ["W1008", ErrorCodeType.Write],
    ])(
      "should trigger Access Denied (Notification) for code %s",
      async (code) => {
        const error = createMockGraphQLError(code);

        await errorCodes.handleGraphqlError(error);

        expect(sharedMocks.displayErrorNotification).toHaveBeenCalledWith(
          "Forbidden",
          "You do not have permission.",
        );
        expect(sharedMocks.setPageStatus).not.toHaveBeenCalled();
      },
    );

    it.each([
      ["W1003", ErrorCodeType.Write],
      ["W1004", ErrorCodeType.Write],
      ["W1008", ErrorCodeType.Write],
      ["R1003", ErrorCodeType.Read],
      ["R1004", ErrorCodeType.Read],
      ["R1008", ErrorCodeType.Read],
    ])(
      "should not trigger any further handlers when skipping for code %s",
      async (code) => {
        const error = createMockGraphQLError(code);

        const errorMessage = await errorCodes.handleGraphqlError(error, true);

        expect(sharedMocks.displayErrorNotification).not.toHaveBeenCalled();
        expect(sharedMocks.setPageStatus).not.toHaveBeenCalled();
        expect(errorMessage).not.toBe("");
      },
    );

    it("should fallback to 401 handler (Unauthorized)", async () => {
      const error = createMockHttpResponse("/", 401, "", "Unauthorized");
      await errorCodes.handleHttpError(error);

      expect(sharedMocks.logout).toHaveBeenCalled();
      expect(sharedMocks.setPageStatus).toHaveBeenCalledWith(
        PageStatus.Unauthorized,
      );
    });

    it("should fallback to 403 handler (Forbidden)", async () => {
      const error = createMockHttpResponse("/", 403, "", "Forbidden");
      await errorCodes.handleHttpError(error);

      expect(sharedMocks.setPageStatus).toHaveBeenCalledWith(
        PageStatus.Forbidden,
      );
    });

    it("should fallback to 404 handler (NotFound)", async () => {
      const error = createMockHttpResponse("/", 404, "", "Not Found");
      await errorCodes.handleHttpError(error);

      expect(sharedMocks.setPageStatus).toHaveBeenCalledWith(
        PageStatus.NotFound,
      );
    });

    it("should use default handler for unknown status codes (e.g. 500)", async () => {
      const error = createMockHttpResponse("/", 500, "", "Server Error");
      await errorCodes.handleHttpError(error);

      expect(sharedMocks.displayErrorNotification).toHaveBeenCalledWith(
        "Error",
        "Server Error",
      );
    });

    it("should use default handler for unknown status codes (e.g. 500) with default message", async () => {
      const error = createMockHttpResponse("/", 500, "", "");
      await errorCodes.handleHttpError(error);

      expect(sharedMocks.displayErrorNotification).toHaveBeenCalledWith(
        "Error",
        "An unknown error occurred",
      );
    });
  });

  describe("Helper Methods", () => {
    describe("getMessageAndCodeFromApolloError", () => {
      it("should extract message from Apollo error body", async () => {
        const apolloError = createMockApolloError("W5014 | id:999");
        const result =
          await errorCodes.getMessageAndCodeFromApolloError(apolloError);

        expect(result.code).toBe("W5014");
        expect(result.message).toBe(
          "No metadata available for item with id 999",
        );
      });
    });
    describe("getMessageAndCodeFromErrorString", () => {
      it("should extract message from error string", async () => {
        const result =
          await errorCodes.getMessageAndCodeFromErrorString("W5014 | id:999");

        expect(result.code).toBe("W5014");
        expect(result.message).toBe(
          "No metadata available for item with id 999",
        );
      });
    });
  });
});
