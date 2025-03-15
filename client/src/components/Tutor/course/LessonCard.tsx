import { LessonCard as IFLessonCard } from "../../../contexts/LessonContext";
import { BsBookHalf, BsCameraVideoFill, BsPencilSquare, BsFillTrashFill } from "react-icons/bs";

interface LessonCardProp {
    setDeleteLesson: React.Dispatch<React.SetStateAction<string>>
}

export default function LessonCard({ _id, name, type, isFreePreview, updatedAt, setDeleteLesson }:IFLessonCard & LessonCardProp) {
    return (
        <div className="lesson-card">
            <div className="card-option-container">
                <button>
                    <i><BsPencilSquare /></i>
                </button>
                <button onClick={() => setDeleteLesson(_id)}>
                    <i><BsFillTrashFill /></i>
                </button>
            </div>
            <p className="title-name">{name}</p>
            <div className="condition-info">
                <span className={"type " + (type === "lecture" ? "active-lecture" : "active-video")}>
                    {type === "lecture" ? <i><BsBookHalf size={15} /></i> : <i><BsCameraVideoFill size={18} /></i>}
                    {type.slice(0, 1).toUpperCase() + type.slice(1)}
                </span>
                {isFreePreview === true && <span className="preview">Preview</span>}
            </div>
            <span className="lesson-updated">Updated At : {new Date(updatedAt).toLocaleString()}</span>
        </div>
    );
}