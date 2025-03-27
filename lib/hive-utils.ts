var dhive = require("@hiveio/dhive");

export function hive_keys_from_login(
    username: string,
    password: string
    ): {
    posting_key: string;
    active_key: string;
    memo_key: string;
    } {

    // Check if username and password are provided
    if (!username || !password) {
        throw new Error("Username and password are required");
    }
    
    const posting_key = dhive.PrivateKey.fromLogin(username, password, "posting");
    const active_key = dhive.PrivateKey.fromLogin(username, password, "active");
    const memo_key = dhive.PrivateKey.fromLogin(username, password, "memo");
    
    return {
        posting_key: posting_key.toString(),
        active_key: active_key.toString(),
        memo_key: memo_key.toString(),
    };
}

