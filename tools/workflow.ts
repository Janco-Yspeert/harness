// The old recorder remains the supported validator for historical artifact
// transitions. New execution is a host client, not a second state machine.
import { legacyWorkflow } from "./legacy-workflow.ts";

async function main(args: string[]): Promise<void> {
  if (args[0] !== "governed") {
    if (
      args.includes("--execute") &&
      process.env.HARNESS_LEGACY_WORKFLOW !== "1"
    )
      throw new Error(
        "Legacy execution is retired. Use workflow governed POST <workflow>/continue with a Workflow Execution Grant.",
      );
    return legacyWorkflow(args);
  }
  const [, method, path, body] = args;
  if (
    (method !== "GET" && method !== "POST") ||
    !path ||
    path.includes("..") ||
    path.startsWith("/")
  )
    throw new Error(
      "Usage: workflow governed <GET|POST> <workflow>/<operation> [json]",
    );
  const response = await fetch(
    `${process.env.HARNESS_HOST_URL ?? "http://127.0.0.1:3000"}/governed/${path}`,
    {
      method,
      headers: {
        authorization: `Bearer ${process.env.HARNESS_ROOT_TOKEN ?? ""}`,
        "content-type": "application/json",
      },
      ...(method === "POST" ? { body: body ?? "{}" } : {}),
    },
  );
  const value = await response.text();
  if (!response.ok) throw new Error(value);
  process.stdout.write(`${value}\n`);
}
void main(process.argv.slice(2)).catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
