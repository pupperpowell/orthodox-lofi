import Pocketbase from "npm:pocketbase";

import { HandleGenerator } from "./HandleGenerator.ts";

export class VisitorAuth {
  private static readonly HANDLE_KEY = "orthodox_lofi_handle";
  private handleGenerator: HandleGenerator;
  private pb: Pocketbase;

  constructor() {
    this.handleGenerator = new HandleGenerator();
    this.pb = new Pocketbase("https://nightbreak.app/");
  }

  public async initializeVisitor(): Promise<string> {
    const existingHandle = this.getVisitorHandle();

    // If a handle already exists, return it
    if (existingHandle) {
      console.log(`Existing handle found: ${existingHandle}`);
      return existingHandle;
    }

    // If no handle exists, generate a new one
    const newHandle = this.handleGenerator.generateHandle();
    localStorage.setItem(VisitorAuth.HANDLE_KEY, newHandle);
    console.log(`New handle generated: ${newHandle}`);
    return newHandle;
  }

  // Get the visitor handle from localStorage, or null if not found
  public getVisitorHandle(): string | null {
    return localStorage.getItem(VisitorAuth.HANDLE_KEY);
  }
}
