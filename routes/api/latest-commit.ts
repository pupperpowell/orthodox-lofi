// routes/api/latest-commit.ts
export const handler = async (req: Request): Promise<Response> => {
  try {
    const command = new Deno.Command("git", {
      args: ["log", "-1", "--pretty=%B"],
      stdout: "piped",
    });

    const output = await command.output();
    const decoder = new TextDecoder();
    const commitMessage = decoder.decode(output.stdout).trim();

    return new Response(JSON.stringify({ message: commitMessage }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching git commit message:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get latest commit message" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
