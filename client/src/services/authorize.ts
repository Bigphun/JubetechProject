// save token
export const authentication = (token:string) => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem("token", JSON.stringify(token));
    }
}

// get token
export const getToken = () => {
    if (typeof window !== "undefined") {
        const token = sessionStorage.getItem("token");
        if (token) {
            return JSON.parse(token);
        } else {
            return false;
        }
    }
}

// check user
export const checkUser = () => {
    if (typeof window !== "undefined") {
        if (sessionStorage.getItem("token")) return true
    }
    return false;
}

// logout
export const logout = () => {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        window.location.href = "/";
    }
}