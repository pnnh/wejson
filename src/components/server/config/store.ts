import { IServerConfigProvider } from "@/components/server/config";

export interface IServerConfigStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  GetValue(key: string): Promise<any | undefined>;

  GetString(key: string): Promise<string | undefined>;

  GetNumber(key: string): Promise<number | undefined>;

  GetBoolean(key: string): Promise<boolean | undefined>;

  GetProvider(): Promise<IServerConfigProvider>;
}
