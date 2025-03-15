import { useState } from "react";
import { IFToggleSidebar } from "../app";
import MainDashboard from "../layouts/MainDashboard";
import CourseManage from "../components/Tutor/course/CourseManage";
import LessonManage from "../components/Tutor/course/LessonManage";
import { LessonProvider } from "../contexts/LessonContext";

import "../assets/css/course/course.css";

export default function CourseManagement({ toggleSidebar, setToggleSidebar }:IFToggleSidebar) {
    const [tabManage, setTabManage] = useState(0);
    return (
        <MainDashboard title="Course Management" order={1} toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar}>
            <LessonProvider>
                <div className="course-manage-container">
                    <ul className="nav nav-underline">
                        <li className="nav-item" onClick={() => setTabManage(0)}>
                            <span className={"nav-link " + (tabManage === 0 ? "active" : "")} style={{ cursor: "pointer" }}>Course</span>
                        </li>
                        <li className="nav-item" onClick={() => setTabManage(1)}>
                            <span className={"nav-link " + (tabManage === 1 ? "active" : "")} style={{ cursor: "pointer" }}>Lesson</span>
                        </li>
                    </ul>
                </div>
                {tabManage === 0 && <CourseManage />}
                {tabManage === 1 && <LessonManage />}
            </LessonProvider>
        </MainDashboard>
    );
}