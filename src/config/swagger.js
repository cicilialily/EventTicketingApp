import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "EventTicketing API",
      version: "1.0.0",
      description:
        "REST API for discovering events, purchasing tickets, managing events, processing payments, and validating event attendees.",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "05ae0ca2-da1c-4c3c-bd43-1f187d5f5443",
            },
            name: {
              type: "string",
              example: "Cicilia",
            },
            email: {
              type: "string",
              format: "email",
              example: "cicilia@example.com",
            },
            role: {
              type: "string",
              enum: ["USER", "ORGANIZER", "ADMIN"],
              example: "USER",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-22T13:25:51.185Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-22T13:25:51.185Z",
            },
          },
        },

        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Logout successful",
            },
            data: {
              nullable: true,
              example: null,
            },
          },
        },

        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password", "confirmPassword"],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "Cicilia",
            },
            email: {
              type: "string",
              format: "email",
              example: "cicilia@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 8,
              example: "Password123",
            },
            confirmPassword: {
              type: "string",
              format: "password",
              example: "Password123",
            },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "cicilia@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password123",
            },
          },
        },

        UpdateProfileRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "Cicilia Lily",
            },
            email: {
              type: "string",
              format: "email",
              example: "cicilialily@example.com",
            },
          },
          minProperties: 1,
        },

        RegisterResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Account created successfully",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },

        LoginResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Login successful",
            },
            data: {
              type: "object",
              properties: {
                accessToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Unable to process request",
            },
            data: {
              nullable: true,
              example: null,
            },
          },
        },

        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Validation failed",
            },
            errors: {
              type: "object",
              additionalProperties: {
                type: "string",
              },
              example: {
                email: "Please provide a valid email address",
              },
            },
            data: {
              nullable: true,
              example: null,
            },
          },
        },
      },
    },

    tags: [
      {
        name: "Authentication",
        description: "Registration and authentication endpoints",
      },
      {
        name: "Users",
        description: "User profile endpoints",
      },
      {
        name: "Events",
        description: "Event management endpoints",
      },
      {
        name: "Orders",
        description: "Order and purchase endpoints",
      },
      {
        name: "Tickets",
        description: "Digital ticket endpoints",
      },
      {
        name: "Payments",
        description: "Payment endpoints",
      },
      {
        name: "Validation",
        description: "Ticket validation and attendee check-in endpoints",
      },
      {
        name: "Analytics",
        description: "Event sales and attendance analytics",
      },
    ],
  },

  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
