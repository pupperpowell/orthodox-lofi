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
      // return existingHandle;
    }

    // If no handle exists, generate a new one
    const newHandle = this.handleGenerator.generateHandle();
    // generateHandle will return a console.log

    try {
      // Check if handle exists in Pocketbase
      const records = await this.pb.collection("lofi").getList(1, 1, {
        filter: `handle = "${newHandle}"`,
      });

      // If handle doesn't exist, create new record
      if (records.totalItems === 0) {
        await this.pb.collection("lofi").create({
          handle: newHandle,
          candles: 0,
        });
        console.log(`New visitor record created in Pocketbase: ${newHandle}`);
      } else {
        console.log(`Handle already exists in Pocketbase: ${newHandle}`);
      }

      localStorage.setItem(VisitorAuth.HANDLE_KEY, newHandle);
      console.log(`New handle generated: ${newHandle}`);
      return newHandle;
    } catch (error) {
      console.error("Error interacting with Pocketbase:", error);
      // Still return the handle even if Pocketbase operations fail
      localStorage.setItem(VisitorAuth.HANDLE_KEY, newHandle);
      return newHandle;
    }
  }

  // Get the visitor handle from localStorage, or null if not found
  public getVisitorHandle(): string | null {
    return localStorage.getItem(VisitorAuth.HANDLE_KEY);
  }

  // Clear the visitor handle from localStorage
  public clearVisitorHandle(): void {
    localStorage.removeItem(VisitorAuth.HANDLE_KEY);
    console.log("Visitor handle cleared");
  }
}
