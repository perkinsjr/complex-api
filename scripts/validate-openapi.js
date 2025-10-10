const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

// Simple OpenAPI validation function
function validateOpenAPISpec(spec) {
  const errors = [];
  const warnings = [];

  // Helper function to validate type fields
  function validateTypeField(value, path) {
    const validTypes = [
      "array",
      "boolean",
      "integer",
      "number",
      "object",
      "string",
    ];

    if (typeof value === "string" && value === "null") {
      errors.push(
        `Invalid type "null" at ${path}. Use "nullable: true" instead.`,
      );
      return false;
    }

    if (typeof value === "string" && !validTypes.includes(value)) {
      errors.push(
        `Invalid type "${value}" at ${path}. Must be one of: ${validTypes.join(", ")}`,
      );
      return false;
    }

    return true;
  }

  // Recursive function to validate schema objects
  function validateSchema(schema, path) {
    if (!schema || typeof schema !== "object") return;

    if (schema.type !== undefined) {
      validateTypeField(schema.type, path);
    }

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        validateSchema(propSchema, `${path}.properties.${propName}`);
      }
    }

    if (schema.items) {
      validateSchema(schema.items, `${path}.items`);
    }

    if (schema.oneOf) {
      schema.oneOf.forEach((subSchema, index) => {
        validateSchema(subSchema, `${path}.oneOf[${index}]`);
      });
    }

    if (schema.allOf) {
      schema.allOf.forEach((subSchema, index) => {
        validateSchema(subSchema, `${path}.allOf[${index}]`);
      });
    }

    if (schema.anyOf) {
      schema.anyOf.forEach((subSchema, index) => {
        validateSchema(subSchema, `${path}.anyOf[${index}]`);
      });
    }
  }

  // Check required root fields
  if (!spec.openapi) {
    errors.push("Missing required field: openapi");
  } else if (!/^3\.\d+\.\d+$/.test(spec.openapi)) {
    errors.push("Invalid OpenAPI version format. Expected 3.x.x format");
  }

  if (!spec.info) {
    errors.push("Missing required field: info");
  } else {
    if (!spec.info.title) errors.push("Missing required field: info.title");
    if (!spec.info.version) errors.push("Missing required field: info.version");
  }

  if (!spec.paths) {
    errors.push("Missing required field: paths");
  } else if (Object.keys(spec.paths).length === 0) {
    warnings.push("No paths defined in the specification");
  }

  // Validate components/schemas first
  if (spec.components && spec.components.schemas) {
    for (const [schemaName, schema] of Object.entries(
      spec.components.schemas,
    )) {
      validateSchema(schema, `components.schemas.${schemaName}`);

      if (
        !schema.type &&
        !schema.$ref &&
        !schema.allOf &&
        !schema.oneOf &&
        !schema.anyOf
      ) {
        warnings.push(`Schema "${schemaName}" has no type definition`);
      }
    }
  }

  // Validate paths
  for (const [pathName, pathItem] of Object.entries(spec.paths || {})) {
    if (!pathName.startsWith("/")) {
      errors.push(`Path "${pathName}" must start with "/"`);
    }

    for (const [method, operation] of Object.entries(pathItem)) {
      const validMethods = [
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "head",
        "options",
        "trace",
      ];
      if (!validMethods.includes(method.toLowerCase())) {
        continue; // Skip non-HTTP method fields like parameters, $ref, etc.
      }

      if (!operation.responses) {
        errors.push(
          `Missing responses for ${method.toUpperCase()} ${pathName}`,
        );
      } else {
        // Validate response schemas
        for (const [statusCode, response] of Object.entries(
          operation.responses,
        )) {
          if (response.content) {
            for (const [mediaType, mediaTypeObject] of Object.entries(
              response.content,
            )) {
              if (mediaTypeObject.schema) {
                validateSchema(
                  mediaTypeObject.schema,
                  `paths.${pathName}.${method}.responses.${statusCode}.content.${mediaType}.schema`,
                );
              }
            }
          }
        }

        if (!operation.responses["200"] && !operation.responses["201"]) {
          warnings.push(
            `No success response defined for ${method.toUpperCase()} ${pathName}`,
          );
        }
      }

      if (!operation.summary && !operation.description) {
        warnings.push(
          `No summary or description for ${method.toUpperCase()} ${pathName}`,
        );
      }

      if (!operation.tags || operation.tags.length === 0) {
        warnings.push(
          `No tags defined for ${method.toUpperCase()} ${pathName}`,
        );
      }
    }
  }

  // Check for unused tags
  const definedTags = new Set((spec.tags || []).map((tag) => tag.name));
  const usedTags = new Set();

  for (const pathItem of Object.values(spec.paths || {})) {
    for (const operation of Object.values(pathItem)) {
      if (operation.tags) {
        operation.tags.forEach((tag) => usedTags.add(tag));
      }
    }
  }

  for (const definedTag of definedTags) {
    if (!usedTags.has(definedTag)) {
      warnings.push(`Tag "${definedTag}" is defined but never used`);
    }
  }

  for (const usedTag of usedTags) {
    if (!definedTags.has(usedTag)) {
      warnings.push(`Tag "${usedTag}" is used but not defined in tags section`);
    }
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

// Stats calculation
function calculateStats(spec) {
  const stats = {
    endpoints: 0,
    methods: {},
    tags: (spec.tags || []).length,
    schemas: 0,
    responses: new Set(),
  };

  // Count endpoints and methods
  for (const pathItem of Object.values(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      const validMethods = [
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "head",
        "options",
        "trace",
      ];
      if (validMethods.includes(method.toLowerCase())) {
        stats.endpoints++;
        stats.methods[method] = (stats.methods[method] || 0) + 1;

        // Count response codes
        if (operation.responses) {
          Object.keys(operation.responses).forEach((code) =>
            stats.responses.add(code),
          );
        }
      }
    }
  }

  // Count schemas
  if (spec.components && spec.components.schemas) {
    stats.schemas = Object.keys(spec.components.schemas).length;
  }

  stats.responses = Array.from(stats.responses).sort();
  return stats;
}

try {
  console.log("🔍 Validating OpenAPI specification...");

  const openapiPath = path.join(__dirname, "..", "openapi.yaml");

  if (!fs.existsSync(openapiPath)) {
    console.error("❌ OpenAPI specification file not found at:", openapiPath);
    console.log(
      '💡 Run "npm run generate:openapi" to generate the specification first',
    );
    process.exit(1);
  }

  const yamlContent = fs.readFileSync(openapiPath, "utf8");
  const spec = yaml.load(yamlContent);

  // Validate the specification
  const validation = validateOpenAPISpec(spec);
  const stats = calculateStats(spec);

  // Print results
  console.log("\n📊 OpenAPI Specification Stats:");
  console.log(`   Title: ${spec.info?.title || "Unknown"}`);
  console.log(`   Version: ${spec.info?.version || "Unknown"}`);
  console.log(`   OpenAPI Version: ${spec.openapi || "Unknown"}`);
  console.log(`   Endpoints: ${stats.endpoints}`);
  console.log(
    `   HTTP Methods: ${Object.entries(stats.methods)
      .map(([method, count]) => `${method.toUpperCase()}(${count})`)
      .join(", ")}`,
  );
  console.log(`   Tags: ${stats.tags}`);
  console.log(`   Schemas: ${stats.schemas}`);
  console.log(`   Response Codes: ${stats.responses.join(", ")}`);

  console.log("\n🔍 Validation Results:");

  if (validation.errors.length > 0) {
    console.log("❌ Errors:");
    validation.errors.forEach((error) => console.log(`   • ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.log("⚠️  Warnings:");
    validation.warnings.forEach((warning) => console.log(`   • ${warning}`));
  }

  if (validation.isValid) {
    if (validation.warnings.length === 0) {
      console.log("✅ OpenAPI specification is valid with no warnings!");
    } else {
      console.log("✅ OpenAPI specification is valid (with warnings)");
    }
    process.exit(0);
  } else {
    console.log("❌ OpenAPI specification is invalid");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Error validating OpenAPI specification:", error.message);
  process.exit(1);
}
