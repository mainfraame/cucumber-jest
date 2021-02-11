export function isJson(text): boolean {
    try {
        JSON.parse(text);
        return true;
    } catch (e) {
        return false;
    }
}
