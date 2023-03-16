export default class GlobalUtils {
    static isDevEnv() {
        return !process.env.NODE_ENV || process.env.NODE_ENV === "development";
    }
}
