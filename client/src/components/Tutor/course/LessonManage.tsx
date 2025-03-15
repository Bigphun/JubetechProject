import LessonCard from "./LessonCard";
import LessonModal from "./LessonModal";
import Toast from 'react-bootstrap/Toast';
import { useState, useEffect } from "react";
import SkeletonLesson from "./SkeletonLesson";
import ToastContainer from 'react-bootstrap/ToastContainer';
import { deleteFile } from "../../../services/storage";
import { useLesson, IFSearchParam, LessonCard as IFLessonCard } from "../../../contexts/LessonContext";
import {
    BsSearch,
    BsFolderPlus,
    BsFillFilterCircleFill
} from "react-icons/bs";

import "../../../assets/css/course/lesson-manage.css";

interface ResponseMessage {
    status: number,
    message: string
}

const isUnknown = (status:number) => status < 200;
const isSuccess = (status:number) => status >= 200 && status < 300;
const isClientError = (status:number) => status >= 400 && status < 500;
const isServerError = (status:number) => status >= 500 && status < 600;

const alertStyle = {
    width: "15px",
    height: "15px",
    marginRight: "10px",
    borderRadius: "5px",
}

export default function LessonManage() {
    // context
    const { state, dispatch, fetchLessonByTutor, deleteLesson:removeLesson, fetchLessonById } = useLesson();
    // state
    const [requestProcess, setRequestProcess] = useState<boolean>(false);
    const [editLesson, setEditLesson] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [startFetch, setStartFetch] = useState<boolean>(true);
    const [filterLesson, setFilterLesson] = useState<IFLessonCard[]>([]);
    const [messageList, setMessageList] = useState<ResponseMessage[]>([]);
    const [deleteLesson, setDeleteLesson] = useState<string>("");
    const [searchLesson, setSearchLesson] = useState<IFSearchParam>({
        name: "",
        type: "",
        isFreePreview: null,
        startDate: "",
        endDate: "",
        page: 1,
        pageSize: 20
    });
    const { name } = searchLesson;
    // useEffect
    useEffect(() => {
        // trigger lesson
        if (state.lessons.length === 0 && startFetch) {
            fetchLessonByTutor("", searchLesson);
            setStartFetch(false);
        } else {
            if (name.trim() !== "") {
                setFilterLesson(state.lessons.filter(lesson => 
                    lesson.name.toLowerCase().includes(name.toLowerCase())
                ));
            } else {
                setFilterLesson(state.lessons);
            }
        }

        if (requestProcess && deleteLesson) {
            setRequestProcess(false);
            removeLessonById();
            setDeleteLesson("");
        }

        if (state.editLesson !== null) {
            removeFile();
        }

        // trigger response
        if (state.response) {
            if (Array.isArray(state.response)) {
                //
            } else {
                const response:ResponseMessage = {
                    status: state.status,
                    message: state.response
                }
                setMessageList([...messageList, response]);
            }
            setTimeout(() => {
                setMessageList((prev) => prev.slice(1));
            }, 3000);
        }
        dispatch({ type: "CLEAR_RESPONSE", message: "" });
    }, [state.lessons, searchLesson, state.response, requestProcess, state.editLesson]);

    /* Function section */
    const removeToast = (removeIndex:number) => {
        setMessageList(messageList.filter((_, index) => index !== removeIndex));
    }
    const handleSearch = (key:string, value:string | number | Date) => {
        setSearchLesson((prev) => ({...prev, [key]:value}));
    }
    const clearSearch = () => {
        setSearchLesson({ name: "", type: "", isFreePreview: null, startDate: "", endDate: "", page: 1, pageSize: 20 });
    }
    const removeFile = async () => {
        if (state.editLesson && state.editLesson.sub_file.length > 0) {
            try {
                console.log(state.editLesson.sub_file);
                const fileDelete = await deleteFile(state.editLesson.sub_file);
                console.log(fileDelete);
                dispatch({ type: "CLEAR_EDIT", message: "" });
            } catch (error) {
                console.error('Error deleting files:', error);
            }
        } else {
            dispatch({ type: "CLEAR_EDIT", message: "" });
        }
        setRequestProcess(true);
    };
    const prepareRemoveLesson = async() => {
        if (deleteLesson !== "") {
            clearSearch();
            fetchLessonById(deleteLesson);
        } else {
            const response:ResponseMessage = {
                status: 0,
                message: "The lesson was not found."
            }
            setMessageList([...messageList, response]);
        }
    }
    const removeLessonById = async() => {
        await removeLesson(deleteLesson, searchLesson);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    /* End section */

    // render
    return (
        <div className="lesson-container">
            <LessonModal
                showModal={showModal}
                setShowModal={setShowModal}
                editLesson={editLesson}
                setEditLesson={setEditLesson}
                messageList={messageList}
                setMessageList={setMessageList}
                searchLesson={searchLesson}
            />
            {messageList.length > 0 &&
                <ToastContainer position="top-end" className="p-3" style={{ zIndex: 99 }}>
                    {messageList.map((alert, index) => (
                        <Toast onClose={() => removeToast(index)} key={index}>
                            <Toast.Header>
                                {isUnknown(alert.status) &&
                                    <div style={{ ...alertStyle, backgroundColor: "gray" }}></div>
                                }
                                {isSuccess(alert.status) &&
                                    <div style={{ ...alertStyle, backgroundColor: "green" }}></div>
                                }
                                {isClientError(alert.status) &&
                                    <div style={{ ...alertStyle, backgroundColor: "red" }}></div>
                                }
                                {isServerError(alert.status) &&
                                    <div style={{ ...alertStyle, backgroundColor: "red" }}></div>
                                }
                                <p className='me-auto'>Lesson alert</p>
                            </Toast.Header>
                            <Toast.Body>
                                <p style={{ fontSize: "0.75rem" }}>{alert.message}</p>
                            </Toast.Body>
                        </Toast>
                    ))}
                </ToastContainer>
            }
            <div className="search-lesson-container">
                <div className="search-input">
                    <input
                        type="text"
                        className="search-inp"
                        placeholder="Search by title for lesson..."
                        onChange={(event) => handleSearch("name", event.target.value)}
                    />
                    <i><BsSearch size={15} /></i>
                </div>
                <div className="option-btn-container">
                    <button id="filter-lesson">
                        <i><BsFillFilterCircleFill size={19} /></i>
                        Advance filter
                    </button>
                    <button id="create-lesson" onClick={() => setShowModal(!showModal)}>
                        <i><BsFolderPlus size={19} /></i>
                        Add lesson
                    </button>
                </div>
            </div>
            {state.loading === true
                ?
                <SkeletonLesson />
                :
                <div className="lesson-card-list">
                    {filterLesson.map((lesson, index) => (
                        <LessonCard
                            {...lesson}
                            key={index}
                            setDeleteLesson={setDeleteLesson}
                        />
                    ))}
                </div>
            }
            <div className={"confirm-delete-lesson " + (deleteLesson.trim() !== "" ? "active-confirm" : "")}>
                <div className={"confirm-delete-card " + (deleteLesson.trim() !== "" ? "active-confirm" : "")}>
                    <p>Are you absolutely sure to delete lesson?</p>
                    <span>This action cannot be undone. This will permanently delete your lesson and remove your data from our servers.</span>
                    <div className="confirm-btn-lesson">
                        <button onClick={() => setDeleteLesson("")}>Cancel</button>
                        <button onClick={prepareRemoveLesson}>Continue</button>
                    </div>
                </div>
            </div>
        </div>
    );
}