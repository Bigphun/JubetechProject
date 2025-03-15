import axios from "axios";
import { getToken } from "./authorize";
import { initializeApp } from "firebase/app";
import {
    getStorage,
    ref,
    uploadBytes,
    deleteObject,
    uploadBytesResumable,
    getDownloadURL 
} from "firebase/storage";

// Initial Cloud Storage
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASURE_ID
}
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Upload File Function
export const uploadFile = async(file:File, path:string, fileName:string) => {
    try {
        if (!file || !path.trim() || !fileName.trim()) return false;
        if (await verifyUser()) {
            const fileRef = ref(storage, `${import.meta.env.VITE_FIREBASE_PATH}${path}/${fileName}`);
            await uploadBytes(fileRef, file);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// Fetch File
export const fetchFileFromStorage = async(path:string, fileName:string) => {
    try {
        if (await verifyUser()) {
            const fileRef = ref(storage, `${import.meta.env.VITE_FIREBASE_PATH}${path}/${fileName}`);
            const url = await getDownloadURL(fileRef);
            return url;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// Upload File And See Progress
export const uploadFileWithProgress = async(file: File, path: string, fileName:string, onProgress:(progress:number) => void) => {
    if (!file || !path.trim() || !fileName.trim()) return false;
    if (await verifyUser()) {
        const fileRef = ref(storage, `${import.meta.env.VITE_FIREBASE_PATH}${path}/${fileName}`);
        const uploadTask = uploadBytesResumable(fileRef, file);
        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                },
                (error) => {
                    reject(error);
                },
                () => {
                    resolve(true);
                }
            );
        });
    }
    return false;
}

// Delete File
export const deleteFile = async(paths:string[]) => {
    try {
        if (await verifyUser()) {
            if (paths.length === 0) return false;
            const deletePromises = paths.map((path:string) => {
                const fileRef = ref(storage, `${import.meta.env.VITE_FIREBASE_PATH}${path}`);
                return deleteObject(fileRef);
            });
            await Promise.all(deletePromises);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

export const verifyUser = async() => {
    try {
        const token = getToken();
        if (!token) return false;
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/getRoleByUser`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (response.data.data !== null) {
            const data = response.data.data;
            if (data.role_ids && data.role_ids.length > 0) {
                const roles = data.role_ids.map((role:{_id:string, role_name:string}) => role.role_name);
                const hasRole = ["Student", "Admin", "Tutor"].some(role => roles.includes(role));
                if (hasRole) return true;
            }
        }
        return false;
    } catch (error) {
        return false;
    }
}