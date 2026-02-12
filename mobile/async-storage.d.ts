// Ambient module declaration for async-storage
// (Separate file because ambient declarations can't coexist
// with module augmentations in the same file)
declare module "@react-native-async-storage/async-storage" {
    export interface AsyncStorageStatic {
        getItem(key: string): Promise<string | null>;
        setItem(key: string, value: string): Promise<void>;
        removeItem(key: string): Promise<void>;
        clear(): Promise<void>;
        getAllKeys(): Promise<readonly string[]>;
    }
    const AsyncStorage: AsyncStorageStatic;
    export default AsyncStorage;
}
