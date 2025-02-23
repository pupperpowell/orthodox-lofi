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

  public async initializeVisitor() {
    // Check localStorage for existing handle
    const existingHandle = this.getVisitorHandle();

    // If it exists,
    if (existingHandle) {
      console.log(`Existing localStorage handle found: ${existingHandle}`);
      try {
        // See if it already exists in Pocketbase
        const record = await this.pb.collection("lofi").getFirstListItem(
          `handle = "${existingHandle}"`,
        );
        // Assuming it exists:
        try {
          // See how many active sessions there are
          const sessions = record.active;

          // Try to increment the active count
          await this.pb.collection("lofi").update(record.id, {
            "active": sessions + 1,
          });
          console.log(
            `${existingHandle} has been active ${sessions + 1} times`,
          );
        } catch (error) {
          console.error(
            "Couldn't update the existing record in Pocketbase: ",
            error,
          );
        }
      } catch (error) {
        // If there's no Pocketbase record, create one
        // @request.headers.origin = "https://nightbreak.app"
        try {
          await this.pb.collection("lofi").create({
            handle: existingHandle,
            candles: 0,
          });
          console.log(
            `New visitor record created in Pocketbase for existing handle: ${existingHandle}`,
          );
        } catch {
          console.error(
            "Couldn't create a record for existing handle in Pocketbase: ",
            error,
          );
        }

        console.error(
          `Error fetching existing record from Pocketbase: ${error}`,
        );
      }
    } else {
      // If there's no localStorage handle,
      console.log(`No localStorage handle found.`);
      // Generate a new handle
      const newHandle = this.handleGenerator.generateHandle();
      try {
        // And create a record for it in Pocketbase
        // @request.headers.origin = "https://nightbreak.app"
        await this.pb.collection("lofi").create({
          handle: newHandle,
          candles: 0,
          active: 1,
        });
        console.log(
          `New visitor record created with new localStorage handle in Pocketbase: ${newHandle}`,
        );
      } catch (error) {
        console.error(`Error creating new visitor record: ${error}`);
      }
    }
  }

  // Get the visitor handle from localStorage, or null if not found
  public getVisitorHandle(): string | null {
    return localStorage.getItem(VisitorAuth.HANDLE_KEY);
  }

  // Clear the visitor handle from localStorage
  public clearVisitorHandle(): void {
    localStorage.removeItem(VisitorAuth.HANDLE_KEY);
    console.log("Visitor handle cleared from localStorage");
  }
}
