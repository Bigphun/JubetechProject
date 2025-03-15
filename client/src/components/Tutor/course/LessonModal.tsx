import { Popover, Select } from "antd";
import TiptapEditor from "./TiptapEditor";
import { useState, useEffect } from "react";
import { uploadFileWithProgress } from "../../../services/storage";
import { CreateLesson, useLesson, IFSearchParam } from "../../../contexts/LessonContext";
import {
    BsXLg,
    BsFillInfoCircleFill,
    BsBook,
    BsPlus,
    BsFillCloudUploadFill,
    BsFileEarmarkWordFill,
    BsFileEarmarkExcelFill,
    BsFileEarmarkPptFill,
    BsFileEarmarkPdfFill,
    BsFileEarmarkImageFill,
    BsFileEarmarkZipFill
} from "react-icons/bs";

interface ResponseMessage {
    status: number,
    message: string
}

interface LessonModalProp {
    showModal: boolean,
    editLesson: string,
    searchLesson: IFSearchParam,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    setEditLesson: React.Dispatch<React.SetStateAction<string>>,
    messageList: ResponseMessage[],
    setMessageList: React.Dispatch<React.SetStateAction<ResponseMessage[]>>
}

const hintContent = (
    <span className="hint-description">
        📚 Course Lessons Made Simple! 🎉 <br />
        You can create lessons in two formats: <br />
        🎥 Video Lessons – Upload and share engaging video content. <br />
        📝 Lecture Notes – Write detailed explanations and insights. <br /><br />

        📂 Attach Learning Materials to both lesson types to enhance the experience! 🚀✨
    </span>
);

const selectStle = {
    width: "100%",
    height: "38px",
}

interface subFileState {
    file: File | string,
    type: string,
    progress: number,
}

const allowedFiles = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/pdf",
    "image/jpeg", "image/png", "image/gif",
    "application/zip",
    "application/x-zip-compressed"
];
const wordFiles = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];
const excelFiles = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const powerPointFiles = [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const pdfFiles = [
    "application/pdf",
];
const imageFiles = [
    "image/jpeg", "image/png", "image/gif",
];
const zipFiles = [
    "application/zip",
    "application/x-zip-compressed"
];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const bytesToMB = (bytes:number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2);
};

export default function LessonModal({ showModal, setShowModal, editLesson, setEditLesson, messageList, setMessageList, searchLesson }:LessonModalProp) {
    // context
    const { state, dispatch, updateLesson, createLesson, fetchLessonById } = useLesson();
    // state
    const [requestProcess, setRequestProcess] = useState<boolean>(false);
    const [subFiles, setSubFiles] = useState<subFileState[]>([]);
    const [lessonForm, setLessonForm] = useState<CreateLesson>({
        name: "",
        type: "",
        sub_file: [],
        main_content: "",
        duration: 0,
        isFreePreview: false,
    });
    const { name, type, main_content, sub_file } = lessonForm;
    // useEffect
    useEffect(() => {
        if (editLesson.trim() !== "") {
            fetchLessonById(editLesson);
            if (state.editLesson !== null) {
                const lesson = state.editLesson;
                setLessonForm({
                    name: lesson.name,
                    type: lesson.type,
                    sub_file: lesson.sub_file,
                    main_content: lesson.main_content,
                    duration: lesson.duration,
                    isFreePreview: lesson.isFreePreview
                });
            }
        } else {
            dispatch({ type: "CLEAR_EDIT", message: "" });
        }

        if (state.status >= 200 && state.status <= 300) {
            setLessonForm({
                name: "",
                type: "",
                sub_file: [],
                main_content: "",
                duration: 0,
                isFreePreview: false,
            });
            setSubFiles([]);
            (document.getElementById("free-preview")! as HTMLInputElement).checked = false;
            setShowModal(false);
        }

        if (requestProcess && editLesson === "") {
            addNewLesson();
            setRequestProcess(false);
        }
    }, [editLesson, state.response, requestProcess]);

    /* Function section */
    const prepareAddLesson = async(event:React.FormEvent) => {
        event.preventDefault();
        if (type.trim() === "") {
            const response:ResponseMessage = {
                status: 400,
                message: "Please select the type of lesson."
            }
            setMessageList([...messageList, response]);
        } else {
            for (let index = 0; index < subFiles.length; index++) {
                const subfile = subFiles[index];
                if (subfile.file instanceof File) {
                    const fileName = new Date().getTime() + "_" + subfile.file.name;
                    const newSubFile = "/course/course_file/" + fileName;
                    await uploadFileWithProgress(subfile.file as File, "/course/course_file/", fileName, (currentProgress: number) => {
                        handleSubfile(index, "progress", Number(currentProgress.toFixed(2)));
                    });
                    setLessonForm((prev) => ({
                        ...prev,
                        sub_file: [...prev.sub_file, newSubFile]
                    }));
                }
            }
            setRequestProcess(true);
        }
    }
    const addNewLesson = async() => {
        await createLesson(lessonForm, searchLesson);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    const modifyLesson = () => {
        //
    }
    const handleLessonForm = (key:string, value:string | string[] | boolean) => {
        setLessonForm(prev => ({
            ...prev,
            [key]: value
        }));
    }
    const handleMaterials = (currentIndex:number, key:string, event:React.ChangeEvent<HTMLInputElement>) => {
        if (event.target && event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.size > MAX_FILE_SIZE) {
                const response:ResponseMessage = {
                    status: 400,
                    message: "The file must be less than 50 Megabytes."
                }
                setMessageList([...messageList, response]);
            } else if (!allowedFiles.includes(file.type)) {
                const response:ResponseMessage = {
                    status: 400,
                    message: "Invalid file type. Please upload a valid file format."
                }
                setMessageList([...messageList, response]);
            } else {
                setSubFiles((prev) => {
                    return prev.map((subfile, index) => (
                        (index === currentIndex ? { ...subfile, [key]: file, type: file.type } : subfile)
                    ));
                });
            }
        } else {
            const response:ResponseMessage = {
                status: 400,
                message: "The file was not found."
            }
            setMessageList([...messageList, response]);
        }
    }
    const handleSubfile = (currentIndex:number, key:string, value:string | number | string[]) => {
        setSubFiles((prev) => {
            return prev.map((subfile, index) => (
                (index === currentIndex ? { ...subfile, [key]: value} : subfile)
            ));
        });
    }
    const addMaterial = () => {
        if (subFiles.length < 5) setSubFiles([...subFiles, { file: "", type: "", progress: 0 }]);
    }
    const removeMaterial = (removeIndex:number) => {
        setSubFiles(subFiles.filter((_, index) => index !== removeIndex));
    }
    /* End section */
    
    // render
    return (
        <div className={"lesson-modal-container " + (showModal ? "active-modal" : "")}>
            <div className={"lesson-modal-card " + (showModal ? "active-modal" : "")}>
                <div className="lesson-modal-form">
                    <div className="lesson-header">
                        {editLesson.trim() !== "" ? <p>Update Lesson</p> : <p>Create Lesson</p>}
                        <button
                            onClick={() => {
                                setEditLesson("");
                                setShowModal(false);
                            }}
                        >
                            <i><BsXLg size={20} /></i>
                        </button>
                    </div>
                    <div className="lesson-body">
                        <Popover content={hintContent} title="How to create lesson?">
                            <span className="hint-content">
                                <i><BsFillInfoCircleFill size={15} /></i>
                                <span>Hint : How to create lesson?</span>
                            </span>
                        </Popover>
                        <form onSubmit={editLesson.trim() !== "" ? modifyLesson : prepareAddLesson}>
                            {/* Name & Type */}
                            <div className="row">
                                <div className="col-md-12 col-lg-6 mt-2">
                                    <div className="form-group">
                                        <label htmlFor="name">Name : </label>
                                        <div className="input-group">
                                            <div className="input-group-text">
                                                <i><BsBook size={18} /></i>
                                            </div>
                                            <input
                                                id="name"
                                                type="text"
                                                value={name}
                                                placeholder="Input your name..."
                                                className="form-control"
                                                onChange={(event) => handleLessonForm("name", event.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12 col-lg-6 mt-2">
                                    <div className="form-group">
                                        <label htmlFor="type">Type : </label>
                                        <Select
                                            id="type"
                                            style={selectStle}
                                            value={type}
                                            placeholder="Select type of lesson..."
                                            options={[
                                                { value: "", label: "None" },
                                                { value: "lecture", label: "Lecture" },
                                                { value: "video", label: "Video" }
                                            ]}
                                            onChange={(selected) => handleLessonForm("type", selected)}
                                            aria-required
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* End section */}
                            
                            {/* Sub File */}
                            <div className="sub-file-container">
                                <p>Instructional materials : </p>
                                <button type="button" className="add-material-btn" onClick={addMaterial}>
                                    <i><BsPlus size={18} /></i>
                                    Add meterial {subFiles.length} / 5
                                </button>
                                {subFiles.map((fileContent, index) => (
                                    <div className="file-card" key={index}>
                                        {fileContent.file !== "" && (
                                            <div className="file-progress-content">
                                                <div className="file-description">
                                                    <p>Material {index + 1}</p>
                                                    <div className="file-information">
                                                        {wordFiles.includes((fileContent.file as File).type) && (
                                                            <i><BsFileEarmarkWordFill size={35}  /></i>
                                                        )}
                                                        {excelFiles.includes((fileContent.file as File).type) && (
                                                            <i><BsFileEarmarkExcelFill size={35} /></i>
                                                        )}
                                                        {powerPointFiles.includes((fileContent.file as File).type) && (
                                                            <i><BsFileEarmarkPptFill size={35} /></i>
                                                        )}
                                                        {imageFiles.includes((fileContent.file as File).type) && (
                                                            <i><BsFileEarmarkImageFill size={35} /></i>
                                                        )}
                                                        {pdfFiles.includes((fileContent.file as File).type) && (
                                                            <i><BsFileEarmarkPdfFill size={35} /></i>
                                                        )}
                                                        {zipFiles.includes((fileContent.file as File).type) && (
                                                            <i><BsFileEarmarkZipFill size={35} /></i>
                                                        )}
                                                        <span>
                                                            {(fileContent.file as File).name}
                                                        </span>
                                                        <span>
                                                            size : {bytesToMB((fileContent.file as File).size)} MB
                                                        </span>
                                                    </div>
                                                    <div className="file-progress-background">
                                                        <div className="file-progress"
                                                            style={{ width: `${fileContent.progress}%` }}
                                                        ></div>
                                                        <span>{fileContent.progress}%</span>
                                                    </div>
                                                </div>
                                                <div className="file-upload-content">
                                                    {fileContent.progress === 0 && (
                                                        <span className="file-inprogress">In progress</span>
                                                    )}
                                                    {fileContent.progress > 0 && fileContent.progress < 100 && (
                                                        <span className="file-uploading">Uploading...</span>
                                                    )}
                                                    {fileContent.progress >= 100 && (
                                                        <span className="file-success">Success</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="remove-sub-file"
                                                        onClick={() => removeMaterial(index)}
                                                    >
                                                    <i><BsXLg size={13} /></i>
                                                </button>
                                                </div>
                                            </div>
                                        )}
                                        {fileContent.file === "" && (
                                            <div className="file-null-content">
                                                <div className="file-description">
                                                    <p>Material {index + 1}</p>
                                                    <span>Accept file: .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf, image, .zip</span>
                                                    <span>Max size: 50 Megabytes</span>
                                                </div>
                                                <div className="file-upload-content">
                                                    <input
                                                        id={"sub-file-" + index}
                                                        value={fileContent.file}
                                                        type="file"
                                                        name={"sub-file-" + index}
                                                        accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,image/*,.zip"
                                                        onChange={(event) => handleMaterials(index, "file", event)}
                                                        hidden
                                                    />
                                                    <label className="file-upload-btn" htmlFor={"sub-file-" + index} style={{ cursor: "pointer" }}>
                                                        <i><BsFillCloudUploadFill size={15} /></i>
                                                        Upload
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className="remove-sub-file"
                                                        onClick={() => removeMaterial(index)}
                                                    >
                                                    <i><BsXLg size={13} /></i>
                                                </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* End section */}

                            <div className="free-preview mt-3">
                                <input type="checkbox" id="free-preview" onChange={(event) => handleLessonForm("isFreePreview", event.target.checked)} />
                                <label htmlFor="free-preview">Free Preview</label>
                            </div>

                            {/* Main content */}
                            <div className="lesson-main-content">
                                {type === "lecture" && (
                                    <div className="lesson-lecture-container">
                                        <TiptapEditor
                                            main_content={main_content}
                                            handleLessonForm={handleLessonForm}
                                        />
                                    </div>
                                )}
                                {type === "video" && (
                                    <div className="lesson-video-container">
                                        Video
                                    </div>
                                )}
                            </div>
                            {/* End section */}

                            <button className="submit-lesson" type="submit">
                                <i><BsPlus size={23} /></i>
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}